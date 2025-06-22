// src/special-offer/dto/create-special-offer.dto.ts
import { IsString, IsNotEmpty, IsNumber, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSpecialOfferDto {
  @ApiProperty({ description: 'Name of the special offer (e.g., "Summer Sale")', example: 'Summer Sale' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Fixed percentage discount (e.g., 10.5 for 10.5%)', example: 10.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  discountPercentage: number;
}
