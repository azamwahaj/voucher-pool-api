// src/voucher/voucher.controller.ts
import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { GenerateVoucherDto } from './dto/generate-voucher.dto';
import { RedeemVoucherDto } from './dto/redeem-voucher.dto';
import { Voucher } from './entities/voucher.entity';
import { ApiTags, ApiResponse, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';
import { RedeemVoucherResponseDto, VoucherResponseDto } from './dto/voucher.dto';

@ApiTags('vouchers') // Tag for Swagger documentation
@Controller('vouchers')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate a new voucher code for a customer and special offer' })
  @ApiBody({ type: GenerateVoucherDto })
  @ApiResponse({ status: 201, description: 'Voucher generated successfully.', type: Voucher })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation failed)' })
  @ApiResponse({ status: 404, description: 'Special Offer not found.' })
  async generate(@Body() generateVoucherDto: GenerateVoucherDto): Promise<Voucher> {
    return this.voucherService.generateVoucher(generateVoucherDto);
  }

  @Post('redeem')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate and redeem a voucher code' })
  @ApiBody({ type: RedeemVoucherDto })
  @ApiResponse({ status: 200, description: 'Voucher redeemed successfully, returns discount percentage.', type: RedeemVoucherResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation failed, voucher expired/used/invalid)' })
  @ApiResponse({ status: 404, description: 'Voucher or Customer not found.' })
  @ApiResponse({ status: 429, description: 'Too Many Requests (Rate Limit Exceeded)' })
  async redeem(@Body() redeemVoucherDto: RedeemVoucherDto): Promise<RedeemVoucherResponseDto> {
    return this.voucherService.redeemVoucher(redeemVoucherDto);
  }

  @Get('customer-valid')
  @ApiOperation({ summary: 'Get all valid voucher codes for a given customer email' })
  @ApiQuery({ name: 'email', description: 'Email of the customer', example: 'john.doe@example.com' })
  @ApiResponse({ status: 200, description: 'Returns an array of valid vouchers.', type: [VoucherResponseDto] })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  async getValidVouchers(@Query('email') email: string): Promise<VoucherResponseDto[]> {
    return this.voucherService.getValidVouchersByEmail(email);
  }
}
