// src/special-offer/entities/special-offer.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Voucher } from '../../voucher/entities/voucher.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('special_offers')
export class SpecialOffer {
  @ApiProperty({ description: 'Unique identifier of the special offer', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the special offer', example: 'Black Friday Discount' })
  @Column({ unique: true, length: 255 })
  name: string;

  @ApiProperty({ description: 'Fixed percentage discount offered by this special offer', example: 15.5 })
  @Column({ type: 'numeric', precision: 5, scale: 2 }) // e.g., 15.50
  discountPercentage: number;

  @ApiProperty({ description: 'Date and time when the special offer was created', example: '2023-10-27T10:00:00Z' })
  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the special offer was last updated', example: '2023-10-27T10:30:00Z' })
  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // One-to-Many relationship with Voucher entity
  @OneToMany(() => Voucher, (voucher) => voucher.specialOffer)
  vouchers: Voucher[];
}
