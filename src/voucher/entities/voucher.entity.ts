// src/voucher/entities/voucher.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { SpecialOffer } from '../../special-offer/entities/special-offer.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('vouchers')
export class Voucher {
  @ApiProperty({ description: 'Unique identifier of the voucher', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Unique randomly generated voucher code', example: 'ABCDEFGH' })
  @Column({ unique: true, length: 20 }) // Ensure sufficient length for generated codes
  code: string;

  @ApiProperty({ description: 'ID of the customer to whom the voucher is assigned' })
  @Column()
  customerId: string; // Foreign key column

  @ApiProperty({ description: 'ID of the special offer associated with this voucher' })
  @Column()
  specialOfferId: string; // Foreign key column

  @ApiProperty({ description: 'Date and time when the voucher expires', example: '2024-12-31T23:59:59Z' })
  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @ApiProperty({ description: 'Indicates if the voucher has been used', example: false })
  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @ApiProperty({ description: 'Date and time when the voucher was used (null if not used)', example: '2024-10-27T10:30:00Z', nullable: true })
  @Column({ type: 'timestamp with time zone', nullable: true })
  usageDate: Date | null;

  @ApiProperty({ description: 'Date and time when the voucher was created', example: '2023-10-27T10:00:00Z' })
  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the voucher was last updated', example: '2023-10-27T10:30:00Z' })
  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Many-to-One relationship with Customer entity
  @ManyToOne(() => Customer, (customer) => customer.vouchers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' }) // Specifies the foreign key column
  customer: Customer;

  // Many-to-One relationship with SpecialOffer entity
  @ManyToOne(() => SpecialOffer, (specialOffer) => specialOffer.vouchers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'specialOfferId' }) // Specifies the foreign key column
  specialOffer: SpecialOffer;
}
