// src/customer/entities/customer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Voucher } from '../../voucher/entities/voucher.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('customers')
export class Customer {
  @ApiProperty({ description: 'Unique identifier of the customer', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the customer', example: 'John Doe' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Unique email address of the customer', example: 'john.doe@example.com' })
  @Column({ unique: true, length: 255 })
  email: string;

  @ApiProperty({ description: 'Date and time when the customer was created', example: '2023-10-27T10:00:00Z' })
  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the customer was last updated', example: '2023-10-27T10:30:00Z' })
  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // One-to-Many relationship with Voucher entity
  @OneToMany(() => Voucher, (voucher) => voucher.customer)
  vouchers: Voucher[];
}
