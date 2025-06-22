// test/special-offer.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SpecialOfferService } from '../src/special-offer/special-offer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpecialOffer } from '../src/special-offer/entities/special-offer.entity';
import { NotFoundException } from '@nestjs/common';

// Mock Repository for SpecialOffer entity
const mockSpecialOfferRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
};

describe('SpecialOfferService', () => {
  let service: SpecialOfferService;
  let repository: Repository<SpecialOffer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecialOfferService,
        {
          provide: getRepositoryToken(SpecialOffer),
          useValue: mockSpecialOfferRepository,
        },
      ],
    }).compile();

    service = module.get<SpecialOfferService>(SpecialOfferService);
    repository = module.get<Repository<SpecialOffer>>(getRepositoryToken(SpecialOffer));
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a special offer', async () => {
      const createSpecialOfferDto = { name: 'Summer Sale', discountPercentage: 10 };
      const expectedOffer = { id: 'uuid-1', ...createSpecialOfferDto, createdAt: new Date(), updatedAt: new Date() };

      mockSpecialOfferRepository.create.mockReturnValue(createSpecialOfferDto);
      mockSpecialOfferRepository.save.mockResolvedValue(expectedOffer);

      const result = await service.create(createSpecialOfferDto);
      expect(result).toEqual(expectedOffer);
      expect(mockSpecialOfferRepository.create).toHaveBeenCalledWith(createSpecialOfferDto);
      expect(mockSpecialOfferRepository.save).toHaveBeenCalledWith(createSpecialOfferDto);
    });
  });

  describe('findByName', () => {
    it('should return a special offer if found by name', async () => {
      const offer = { id: 'uuid-1', name: 'Summer Sale', discountPercentage: 10, createdAt: new Date(), updatedAt: new Date() };
      mockSpecialOfferRepository.findOne.mockResolvedValue(offer);

      const result = await service.findByName('Summer Sale');
      expect(result).toEqual(offer);
      expect(mockSpecialOfferRepository.findOne).toHaveBeenCalledWith({ where: { name: 'Summer Sale' } });
    });

    it('should return null if special offer not found by name', async () => {
      mockSpecialOfferRepository.findOne.mockResolvedValue(null);

      const result = await service.findByName('NonExistent Sale');
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a special offer if found by id', async () => {
      const offer = { id: 'uuid-1', name: 'Summer Sale', discountPercentage: 10, createdAt: new Date(), updatedAt: new Date() };
      mockSpecialOfferRepository.findOne.mockResolvedValue(offer);

      const result = await service.findOne('uuid-1');
      expect(result).toEqual(offer);
      expect(mockSpecialOfferRepository.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    });

    it('should throw NotFoundException if special offer not found by id', async () => {
      mockSpecialOfferRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of special offers', async () => {
      const offers = [{ id: 'uuid-1', name: 'Offer 1', discountPercentage: 5, createdAt: new Date(), updatedAt: new Date() }];
      mockSpecialOfferRepository.find.mockResolvedValue(offers);

      const result = await service.findAll();
      expect(result).toEqual(offers);
      expect(mockSpecialOfferRepository.find).toHaveBeenCalled();
    });

    it('should return an empty array if no special offers exist', async () => {
      mockSpecialOfferRepository.find.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('should successfully delete a special offer', async () => {
      mockSpecialOfferRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('uuid-1');
      expect(result).toBe(true);
      expect(mockSpecialOfferRepository.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw NotFoundException if special offer not found for deletion', async () => {
      mockSpecialOfferRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('nonexistent-uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
