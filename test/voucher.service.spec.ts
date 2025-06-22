// test/voucher.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { VoucherService } from '../src/voucher/voucher.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Voucher } from '../src/voucher/entities/voucher.entity';
import { CustomerService } from '../src/customer/customer.service';
import { SpecialOfferService } from '../src/special-offer/special-offer.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Customer } from '../src/customer/entities/customer.entity';
import { SpecialOffer } from '../src/special-offer/entities/special-offer.entity';
import { GenerateVoucherDto } from '../src/voucher/dto/generate-voucher.dto';
import { RedeemVoucherDto } from '../src/voucher/dto/redeem-voucher.dto';

// Mock Repository for Voucher entity
const mockVoucherRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

// Mock CustomerService
const mockCustomerService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

// Mock SpecialOfferService
const mockSpecialOfferService = {
  findByName: jest.fn(),
};

// Mock DataSource and QueryRunner for transactions
const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    findOne: jest.fn(),
    save: jest.fn(),
  },
};

const mockDataSource = {
  createQueryRunner: jest.fn(() => mockQueryRunner),
};

describe('VoucherService', () => {
  let service: VoucherService;
  let voucherRepository: Repository<Voucher>;
  let customerService: CustomerService;
  let specialOfferService: SpecialOfferService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoucherService,
        {
          provide: getRepositoryToken(Voucher),
          useValue: mockVoucherRepository,
        },
        {
          provide: CustomerService,
          useValue: mockCustomerService,
        },
        {
          provide: SpecialOfferService,
          useValue: mockSpecialOfferService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<VoucherService>(VoucherService);
    voucherRepository = module.get<Repository<Voucher>>(getRepositoryToken(Voucher));
    customerService = module.get<CustomerService>(CustomerService);
    specialOfferService = module.get<SpecialOfferService>(SpecialOfferService);
    dataSource = module.get<DataSource>(DataSource);

    // Reset all mocks before each test
    jest.clearAllMocks();
    jest.useRealTimers(); // Ensure real timers are used by default
  });

  afterEach(() => {
    jest.useRealTimers(); // Clean up fake timers after each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateVoucher', () => {
    const generateVoucherDto: GenerateVoucherDto = {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      specialOfferName: 'Summer Sale',
      expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // 1 year from now
    };

    const mockCustomer: Customer = {
      id: 'cust-uuid-1',
      name: 'Test Customer',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      vouchers: [],
    };

    const mockSpecialOffer: SpecialOffer = {
      id: 'offer-uuid-1',
      name: 'Summer Sale',
      discountPercentage: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      vouchers: [],
    };

    it('should generate a voucher for an existing customer', async () => {
      mockCustomerService.findByEmail.mockResolvedValue(mockCustomer);
      mockSpecialOfferService.findByName.mockResolvedValue(mockSpecialOffer);
      mockVoucherRepository.findOne.mockResolvedValue(null); // Ensure code is unique
      mockVoucherRepository.create.mockImplementation((dto) => dto);
      mockVoucherRepository.save.mockImplementation((voucher) => ({
        id: 'voucher-uuid-1',
        code: 'UNIQUECODE',
        ...voucher,
        customer: mockCustomer,
        specialOffer: mockSpecialOffer,
      }));

      const result = await service.generateVoucher(generateVoucherDto);

      expect(mockCustomerService.findByEmail).toHaveBeenCalledWith(generateVoucherDto.customerEmail);
      expect(mockCustomerService.create).not.toHaveBeenCalled(); // Customer already exists
      expect(mockSpecialOfferService.findByName).toHaveBeenCalledWith(generateVoucherDto.specialOfferName);
      expect(voucherRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
      expect(result.customerId).toBe(mockCustomer.id);
      expect(result.specialOfferId).toBe(mockSpecialOffer.id);
      expect(result.isUsed).toBe(false);
    });

    it('should generate a voucher and create a new customer', async () => {
      mockCustomerService.findByEmail.mockResolvedValue(null); // Customer does not exist
      mockCustomerService.create.mockResolvedValue(mockCustomer);
      mockSpecialOfferService.findByName.mockResolvedValue(mockSpecialOffer);
      mockVoucherRepository.findOne.mockResolvedValue(null); // Ensure code is unique
      mockVoucherRepository.create.mockImplementation((dto) => dto);
      mockVoucherRepository.save.mockImplementation((voucher) => ({
        id: 'voucher-uuid-1',
        code: 'UNIQUECODE',
        ...voucher,
        customer: mockCustomer,
        specialOffer: mockSpecialOffer,
      }));

      const result = await service.generateVoucher(generateVoucherDto);

      expect(mockCustomerService.findByEmail).toHaveBeenCalledWith(generateVoucherDto.customerEmail);
      expect(mockCustomerService.create).toHaveBeenCalledWith({
        name: generateVoucherDto.customerName,
        email: generateVoucherDto.customerEmail,
      });
      expect(mockSpecialOfferService.findByName).toHaveBeenCalledWith(generateVoucherDto.specialOfferName);
      expect(voucherRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if special offer not found', async () => {
      mockCustomerService.findByEmail.mockResolvedValue(mockCustomer);
      mockSpecialOfferService.findByName.mockResolvedValue(null); // Special offer not found

      await expect(service.generateVoucher(generateVoucherDto)).rejects.toThrow(NotFoundException);
      expect(mockVoucherRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('redeemVoucher', () => {
    const redeemVoucherDto: RedeemVoucherDto = {
      code: 'VALIDCODE1',
      customerEmail: 'redeem@example.com',
    };

    const mockCustomer: Customer = {
      id: 'cust-uuid-2',
      name: 'Redeem Customer',
      email: 'redeem@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      vouchers: [],
    };

    const mockSpecialOffer: SpecialOffer = {
      id: 'offer-uuid-2',
      name: 'Redeem Offer',
      discountPercentage: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
      vouchers: [],
    };

    const mockValidVoucher: Voucher = {
      id: 'voucher-uuid-2',
      code: 'VALIDCODE1',
      customerId: mockCustomer.id,
      specialOfferId: mockSpecialOffer.id,
      expirationDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24), // tomorrow
      isUsed: false,
      usageDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: mockCustomer,
      specialOffer: mockSpecialOffer,
    };

    it('should successfully redeem a valid voucher', async () => {
      // Mock findOne for Customer, then for Voucher, then for SpecialOffer
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCustomer) // First call: find Customer
        .mockResolvedValueOnce(mockValidVoucher) // Second call: find Voucher with lock
        .mockResolvedValueOnce(mockSpecialOffer); // Third call: find SpecialOffer

      mockQueryRunner.manager.save.mockResolvedValue({ ...mockValidVoucher, isUsed: true, usageDate: new Date() });

      const result = await service.redeemVoucher(redeemVoucherDto);

      expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.findOne).toHaveBeenCalledWith(Customer, { where: { email: redeemVoucherDto.customerEmail } });
      expect(mockQueryRunner.manager.findOne).toHaveBeenCalledWith(Voucher, {
        where: { code: redeemVoucherDto.code },
        lock: { mode: 'for_no_key_update' },
      });
      expect(mockQueryRunner.manager.findOne).toHaveBeenCalledWith(SpecialOffer, { where: { id: mockSpecialOffer.id } });
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(Voucher, expect.objectContaining({ isUsed: true }));
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual({ discountPercentage: mockSpecialOffer.discountPercentage });
    });

    it('should throw NotFoundException if customer not found during redeem', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null); // Customer not found

      await expect(service.redeemVoucher(redeemVoucherDto)).rejects.toThrow(NotFoundException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw NotFoundException if voucher not found during redeem', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(mockCustomer).mockResolvedValueOnce(null); // Voucher not found

      await expect(service.redeemVoucher(redeemVoucherDto)).rejects.toThrow(NotFoundException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw BadRequestException if voucher is not assigned to customer', async () => {
      const voucherNotAssigned = { ...mockValidVoucher, customerId: 'another-cust-id' };
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCustomer)
        .mockResolvedValueOnce(voucherNotAssigned)
        .mockResolvedValueOnce(mockSpecialOffer); // Ensure special offer is found

      await expect(service.redeemVoucher(redeemVoucherDto)).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw BadRequestException if voucher is already used', async () => {
      const usedVoucher = { ...mockValidVoucher, isUsed: true, usageDate: new Date() };
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCustomer)
        .mockResolvedValueOnce(usedVoucher)
        .mockResolvedValueOnce(mockSpecialOffer); // Ensure special offer is found

      await expect(service.redeemVoucher(redeemVoucherDto)).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw BadRequestException if voucher has expired', async () => {
      const expiredVoucher = { ...mockValidVoucher, expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }; // 1 year ago
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCustomer)
        .mockResolvedValueOnce(expiredVoucher)
        .mockResolvedValueOnce(mockSpecialOffer); // Ensure special offer is found

      await expect(service.redeemVoucher(redeemVoucherDto)).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      // Mock an error during the process (e.g., finding the voucher)
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCustomer)
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.redeemVoucher(redeemVoucherDto)).rejects.toThrow('DB Error');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('getValidVouchersByEmail', () => {
    const customerEmail = 'validvouchers@example.com';
    const mockCustomer: Customer = {
      id: 'cust-uuid-3',
      name: 'Valid Customer',
      email: customerEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
      vouchers: [],
    };

    const mockSpecialOffer1: SpecialOffer = {
      id: 'offer-uuid-3', name: 'Offer A', discountPercentage: 5, createdAt: new Date(), updatedAt: new Date(), vouchers: []
    };
    const mockSpecialOffer2: SpecialOffer = {
      id: 'offer-uuid-4', name: 'Offer B', discountPercentage: 15, createdAt: new Date(), updatedAt: new Date(), vouchers: []
    };

    let fixedNow: Date;

    beforeEach(() => {
      // Use fake timers to control Date.now()
      jest.useFakeTimers();
      fixedNow = new Date('2025-06-22T12:00:00Z'); // A fixed point in time
      jest.setSystemTime(fixedNow);
    });

    afterEach(() => {
      jest.useRealTimers(); // Restore real timers after each test
    });


    const mockVouchers = (now: Date) => ([
      { // Valid voucher
        id: 'v1', code: 'CODE1', customerId: mockCustomer.id, specialOfferId: mockSpecialOffer1.id, expirationDate: new Date(now.getTime() + 1000 * 60 * 60), // 1 hour from now
        isUsed: false, usageDate: null, createdAt: now, updatedAt: now, customer: mockCustomer, specialOffer: mockSpecialOffer1,
      },
      { // Expired voucher
        id: 'v2', code: 'CODE2', customerId: mockCustomer.id, specialOfferId: mockSpecialOffer1.id, expirationDate: new Date(now.getTime() - 1000), // 1 second ago
        isUsed: false, usageDate: null, createdAt: now, updatedAt: now, customer: mockCustomer, specialOffer: mockSpecialOffer1,
      },
      { // Used voucher (should be filtered by isUsed: false in query)
        id: 'v3', code: 'CODE3', customerId: mockCustomer.id, specialOfferId: mockSpecialOffer2.id, expirationDate: new Date(now.getTime() + 1000 * 60 * 60), // 1 hour from now
        isUsed: true, usageDate: now, createdAt: now, updatedAt: now, customer: mockCustomer, specialOffer: mockSpecialOffer2,
      },
      { // Another valid voucher
        id: 'v4', code: 'CODE4', customerId: mockCustomer.id, specialOfferId: mockSpecialOffer2.id, expirationDate: new Date(now.getTime() + 1000 * 60 * 60 * 2), // 2 hours from now
        isUsed: false, usageDate: null, createdAt: now, updatedAt: now, customer: mockCustomer, specialOffer: mockSpecialOffer2,
      },
    ]);


    it('should return valid vouchers for a given email', async () => {
      mockCustomerService.findByEmail.mockResolvedValue(mockCustomer);

      // Mock the find method to return only the non-used vouchers as per the query's 'where' clause
      mockVoucherRepository.find.mockImplementation((options) => {
        const allVouchers = mockVouchers(fixedNow);
        if (options?.where && options.where['isUsed'] === false) {
          return Promise.resolve(allVouchers.filter(v => !v.isUsed));
        }
        return Promise.resolve(allVouchers);
      });

      const result = await service.getValidVouchersByEmail(customerEmail);

      expect(mockCustomerService.findByEmail).toHaveBeenCalledWith(customerEmail);
      expect(mockVoucherRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            customerId: mockCustomer.id,
            isUsed: false,
          },
          relations: ['specialOffer'],
        }),
      );
      expect(result.length).toBe(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: 'CODE1', specialOfferName: 'Offer A', discountPercentage: 5, expirationDate: expect.any(Date) }),
          expect.objectContaining({ code: 'CODE4', specialOfferName: 'Offer B', discountPercentage: 15, expirationDate: expect.any(Date) }),
        ]),
      );
    });

    it('should return an empty array if no valid vouchers found', async () => {
      mockCustomerService.findByEmail.mockResolvedValue(mockCustomer);
      // Mock find to return only used and expired vouchers that would be filtered out
      mockVoucherRepository.find.mockImplementation((options) => {
        const allVouchers = mockVouchers(fixedNow);
        if (options?.where && options.where['isUsed'] === false) {
            return Promise.resolve(allVouchers.filter(v => v.isUsed === false && v.expirationDate < fixedNow)); // Only return expired non-used ones
        }
        return Promise.resolve([]);
      });


      const result = await service.getValidVouchersByEmail(customerEmail);
      expect(result).toEqual([]);
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockCustomerService.findByEmail.mockResolvedValue(null);

      await expect(service.getValidVouchersByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundException);
    });
  });
});
