// src/special-offer/special-offer.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpecialOffer } from './entities/special-offer.entity';
import { CreateSpecialOfferDto } from './dto/create-special-offer.dto';

@Injectable()
export class SpecialOfferService {
  constructor(
    @InjectRepository(SpecialOffer)
    private specialOfferRepository: Repository<SpecialOffer>,
  ) {}

  /**
   * Creates a new special offer.
   * @param createSpecialOfferDto DTO for creating a special offer.
   * @returns The created special offer.
   */
  async create(createSpecialOfferDto: CreateSpecialOfferDto): Promise<SpecialOffer> {
    const specialOffer = this.specialOfferRepository.create(createSpecialOfferDto);
    return this.specialOfferRepository.save(specialOffer);
  }

  /**
   * Finds a special offer by its name.
   * @param name The name of the special offer.
   * @returns The special offer if found, otherwise null.
   */
  async findByName(name: string): Promise<SpecialOffer | null> {
    return this.specialOfferRepository.findOne({ where: { name } });
  }

  /**
   * Finds a special offer by its ID.
   * @param id The ID of the special offer.
   * @returns The special offer if found.
   * @throws NotFoundException if the special offer is not found.
   */
  async findOne(id: string): Promise<SpecialOffer> {
    const offer = await this.specialOfferRepository.findOne({ where: { id } });
    if (!offer) {
      throw new NotFoundException(`Special offer with ID "${id}" not found.`);
    }
    return offer;
  }

  /**
   * Retrieves all special offers.
   * @returns A list of all special offers.
   */
  async findAll(): Promise<SpecialOffer[]> {
    return this.specialOfferRepository.find();
  }

  /**
   * Deletes a special offer by its ID.
   * @param id The ID of the special offer to delete.
   * @returns True if the special offer was deleted, false otherwise.
   * @throws NotFoundException if the special offer is not found.
   */
  async remove(id: string): Promise<boolean> {
    const result = await this.specialOfferRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Special offer with ID "${id}" not found.`);
    }
    return true;
  }
}
