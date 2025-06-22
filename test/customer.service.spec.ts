// test/customer.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from '../src/customer/customer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../src/customer/entities/customer.entity';
import { NotFoundException } from '@nestjs/common';

// Mock Repository for Customer entity
const mockCustomerRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
};

describe('CustomerService', () => {
  let service: CustomerService;
  let repository: Repository<Customer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    repository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a customer', async () => {
      const createCustomerDto = { name: 'Test User', email: 'test@example.com' };
      const expectedCustomer = { id: 'uuid-1', ...createCustomerDto, createdAt: new Date(), updatedAt: new Date() };

      mockCustomerRepository.create.mockReturnValue(createCustomerDto);
      mockCustomerRepository.save.mockResolvedValue(expectedCustomer);

      const result = await service.create(createCustomerDto);
      expect(result).toEqual(expectedCustomer);
      expect(mockCustomerRepository.create).toHaveBeenCalledWith(createCustomerDto);
      expect(mockCustomerRepository.save).toHaveBeenCalledWith(createCustomerDto);
    });
  });

  describe('findByEmail', () => {
    it('should return a customer if found by email', async () => {
      const customer = { id: 'uuid-1', name: 'Test User', email: 'test@example.com', createdAt: new Date(), updatedAt: new Date() };
      mockCustomerRepository.findOne.mockResolvedValue(customer);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(customer);
      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should return null if customer not found by email', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a customer if found by id', async () => {
      const customer = { id: 'uuid-1', name: 'Test User', email: 'test@example.com', createdAt: new Date(), updatedAt: new Date() };
      mockCustomerRepository.findOne.mockResolvedValue(customer);

      const result = await service.findOne('uuid-1');
      expect(result).toEqual(customer);
      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    });

    it('should throw NotFoundException if customer not found by id', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of customers', async () => {
      const customers = [{ id: 'uuid-1', name: 'User 1', email: 'user1@example.com', createdAt: new Date(), updatedAt: new Date() }];
      mockCustomerRepository.find.mockResolvedValue(customers);

      const result = await service.findAll();
      expect(result).toEqual(customers);
      expect(mockCustomerRepository.find).toHaveBeenCalled();
    });

    it('should return an empty array if no customers exist', async () => {
      mockCustomerRepository.find.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('should successfully delete a customer', async () => {
      mockCustomerRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('uuid-1');
      expect(result).toBe(true);
      expect(mockCustomerRepository.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw NotFoundException if customer not found for deletion', async () => {
      mockCustomerRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('nonexistent-uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
