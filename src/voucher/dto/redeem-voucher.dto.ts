// src/voucher/dto/redeem-voucher.dto.ts
import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RedeemVoucherDto {
  @ApiProperty({ description: 'The unique voucher code to redeem', example: 'VOUCHER123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8) // Minimum length for voucher codes as per requirements
  @MaxLength(20) // Max length for safety
  code: string;

  @ApiProperty({ description: 'The email of the customer attempting to redeem the voucher', example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  customerEmail: string;
}
