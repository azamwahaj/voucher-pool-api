// src/voucher/voucher.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { Voucher } from './entities/voucher.entity';
import { CustomerService } from '../customer/customer.service';
import { SpecialOfferService } from '../special-offer/special-offer.service';
import { GenerateVoucherDto } from './dto/generate-voucher.dto';
import { RedeemVoucherDto } from './dto/redeem-voucher.dto';
import { VoucherResponseDto } from './dto/voucher.dto';
import { Customer } from '../customer/entities/customer.entity'; // Explicitly import Customer entity class
import { SpecialOffer } from '../special-offer/entities/special-offer.entity'; // Explicitly import SpecialOffer entity class

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    private customerService: CustomerService,
    private specialOfferService: SpecialOfferService,
    private dataSource: DataSource, // Inject DataSource for manual transaction management
  ) {}

  /**
   * Generates a unique voucher code.
   * Ensures the generated code does not already exist in the database.
   * @param length The desired length of the voucher code.
   * @returns A unique voucher code string.
   */
  private async generateUniqueVoucherCode(length: number = 10): Promise<string> {
    let code: string;
    let exists: Voucher | null;
    do {
      code = nanoid(length).toUpperCase(); // Generate a random string, convert to uppercase
      exists = await this.voucherRepository.findOne({ where: { code } });
    } while (exists); // Keep generating until a unique code is found
    return code;
  }

  /**
   * Generates a new voucher for a customer and a special offer.
   * If the customer does not exist, a new customer record is created.
   * @param generateVoucherDto DTO containing customer email, special offer name, and expiration date.
   * @returns The newly created voucher.
   * @throws NotFoundException if the special offer is not found.
   * @throws ConflictException if a voucher already exists for this customer and special offer (optional: depends on business rule).
   */
  async generateVoucher(generateVoucherDto: GenerateVoucherDto): Promise<Voucher> {
    const { customerName, customerEmail, specialOfferName, expirationDate } = generateVoucherDto;

    // Find or create customer
    let customer = await this.customerService.findByEmail(customerEmail);
    if (!customer) {
      customer = await this.customerService.create({ name: customerName, email: customerEmail });
    }

    // Find special offer
    const specialOffer = await this.specialOfferService.findByName(specialOfferName);
    if (!specialOffer) {
      throw new NotFoundException(`Special offer with name "${specialOfferName}" not found.`);
    }

    // Check if a voucher for this customer and special offer already exists (optional business rule)
    // For this implementation, we allow multiple vouchers for the same customer/offer.
    // If you need to restrict, add a check here:
    // const existingVoucher = await this.voucherRepository.findOne({
    //   where: { customerId: customer.id, specialOfferId: specialOffer.id },
    // });
    // if (existingVardingVoucher) {
    //   throw new ConflictException('Voucher already exists for this customer and special offer.');
    // }

    const code = await this.generateUniqueVoucherCode();

    const voucher = this.voucherRepository.create({
      code,
      customerId: customer.id,
      specialOfferId: specialOffer.id,
      expirationDate: new Date(expirationDate), // Ensure it's a Date object
      isUsed: false,
      usageDate: null,
    });

    return this.voucherRepository.save(voucher);
  }

  /**
   * Validates and redeems a voucher code for a given email.
   * This operation is performed within a database transaction to ensure atomicity.
   * @param redeemVoucherDto DTO containing voucher code and customer email.
   * @returns The percentage discount if the voucher is valid and redeemed.
   * @throws NotFoundException if the voucher or customer is not found.
   * @throws BadRequestException if the voucher is invalid (e.g., expired, already used, not assigned to customer).
   */
  async redeemVoucher(redeemVoucherDto: RedeemVoucherDto): Promise<{ discountPercentage: number }> {
    const { code, customerEmail } = redeemVoucherDto;

    // Use a transaction for atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the customer
      const customer = await queryRunner.manager.findOne(Customer, { where: { email: customerEmail } });
      if (!customer) {
        throw new NotFoundException(`Customer with email "${customerEmail}" not found.`);
      }

      // Find the voucher and lock it for update within the transaction WITHOUT relations
      const voucher = await queryRunner.manager.findOne(Voucher, {
        where: { code },
        lock: { mode: 'for_no_key_update' }, // Lock the row during the transaction
      });

      if (!voucher) {
        throw new NotFoundException(`Voucher with code "${code}" not found.`);
      }

      // Fetch the special offer separately after acquiring the lock on the voucher
      const specialOffer = await queryRunner.manager.findOne(SpecialOffer, {
        where: { id: voucher.specialOfferId },
      });

      if (!specialOffer) {
        // This case should ideally not happen if foreign key constraints are well-maintained
        throw new NotFoundException(`Associated Special Offer for voucher "${code}" not found.`);
      }

      // Validate the voucher
      if (voucher.customerId !== customer.id) {
        throw new BadRequestException('Voucher is not assigned to this customer.');
      }
      if (voucher.isUsed) {
        throw new BadRequestException('Voucher has already been used.');
      }
      if (voucher.expirationDate < new Date()) {
        throw new BadRequestException('Voucher has expired.');
      }

      // Mark voucher as used and set usage date
      voucher.isUsed = true;
      voucher.usageDate = new Date();
      await queryRunner.manager.save(Voucher, voucher);

      await queryRunner.commitTransaction(); // Commit the transaction if all operations succeed

      return { discountPercentage: specialOffer.discountPercentage }; // Use the fetched specialOffer
    } catch (error) {
      await queryRunner.rollbackTransaction(); // Rollback in case of any error
      // Re-throw the error for the controller to handle
      throw error;
    } finally {
      await queryRunner.release(); // Release the query runner connection
    }
  }

  /**
   * Retrieves all valid (not expired and not used) voucher codes for a given email.
   * @param customerEmail The email of the customer.
   * @returns An array of valid voucher codes with their associated special offer name and discount.
   * @throws NotFoundException if the customer is not found.
   */
  async getValidVouchersByEmail(customerEmail: string): Promise<VoucherResponseDto[]> {
    const customer = await this.customerService.findByEmail(customerEmail);
    if (!customer) {
      throw new NotFoundException(`Customer with email "${customerEmail}" not found.`);
    }

    const now = new Date();
    const vouchers = await this.voucherRepository.find({
      where: {
        customerId: customer.id,
        isUsed: false,
        // Removed `expirationDate: {}` as it's not a valid TypeORM query operator
        // The filtering is handled by `vouchers.filter` below.
      },
      relations: ['specialOffer'], // Load related special offer data
    });

    // Filter out truly expired vouchers and map to DTO
    return vouchers
      .filter(voucher => voucher.expirationDate >= now) // Explicitly filter for non-expired
      .map((voucher) => ({
        code: voucher.code,
        specialOfferName: voucher.specialOffer.name,
        discountPercentage: voucher.specialOffer.discountPercentage,
        expirationDate: voucher.expirationDate,
      }));
  }
}
