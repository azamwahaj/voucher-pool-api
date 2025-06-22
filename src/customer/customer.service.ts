// src/customer/customer.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  /**
   * Creates a new customer.
   * @param createCustomerDto DTO for creating a customer.
   * @returns The created customer.
   */
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  /**
   * Finds a customer by their email.
   * @param email The email of the customer.
   * @returns The customer if found, otherwise null.
   */
  async findByEmail(email: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { email } });
  }

  /**
   * Finds a customer by their ID.
   * @param id The ID of the customer.
   * @returns The customer if found.
   * @throws NotFoundException if the customer is not found.
   */
  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID "${id}" not found.`);
    }
    return customer;
  }

  /**
   * Retrieves all customers.
   * @returns A list of all customers.
   */
  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  /**
   * Deletes a customer by their ID.
   * @param id The ID of the customer to delete.
   * @returns True if the customer was deleted, false otherwise.
   * @throws NotFoundException if the customer is not found.
   */
  async remove(id: string): Promise<boolean> {
    const result = await this.customerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Customer with ID "${id}" not found.`);
    }
    return true;
  }
}
