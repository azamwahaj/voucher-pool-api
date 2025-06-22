// src/voucher/dto/generate-voucher.dto.ts
import { IsString, IsEmail, IsNotEmpty, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateVoucherDto {
  @ApiProperty({ description: 'Name of the customer for whom the voucher is generated', example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  customerName: string;

  @ApiProperty({ description: 'Email of the customer for whom the voucher is generated', example: 'jane.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  customerEmail: string;

  @ApiProperty({ description: 'Name of the special offer for this voucher', example: 'Christmas Sale' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  specialOfferName: string;

  @ApiProperty({ description: 'Expiration date of the voucher (ISO 8601 format)', example: '2025-12-31T23:59:59Z' })
  @IsDateString()
  @IsNotEmpty()
  expirationDate: string; // Use string for DTO input, convert to Date object in service
}
