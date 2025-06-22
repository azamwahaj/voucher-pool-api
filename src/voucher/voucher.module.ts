// src/voucher/voucher.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { Voucher } from './entities/voucher.entity';
import { CustomerModule } from '../customer/customer.module';
import { SpecialOfferModule } from '../special-offer/special-offer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voucher]),
    CustomerModule, // Import CustomerModule to use CustomerService
    SpecialOfferModule, // Import SpecialOfferModule to use SpecialOfferService
  ],
  controllers: [VoucherController],
  providers: [VoucherService],
})
export class VoucherModule {}
