// src/voucher/dto/voucher.dto.ts
import { ApiProperty } from '@nestjs/swagger';

// DTO for returning voucher details (used for getValidVouchersByEmail)
export class VoucherResponseDto {
  @ApiProperty({ description: 'The unique voucher code', example: 'VOUCHER123' })
  code: string;

  @ApiProperty({ description: 'Name of the special offer associated with the voucher', example: 'Summer Sale' })
  specialOfferName: string;

  @ApiProperty({ description: 'Percentage discount offered by the special offer', example: 10.5 })
  discountPercentage: number;

  @ApiProperty({ description: 'Expiration date of the voucher', example: '2025-12-31T23:59:59.000Z' })
  expirationDate: Date;
}

// DTO for redemption response
export class RedeemVoucherResponseDto {
  @ApiProperty({ description: 'The percentage discount provided by the redeemed voucher', example: 15.0 })
  discountPercentage: number;
}
