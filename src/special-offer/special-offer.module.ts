// src/special-offer/special-offer.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialOfferService } from './special-offer.service';
import { SpecialOfferController } from './special-offer.controller';
import { SpecialOffer } from './entities/special-offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpecialOffer])],
  controllers: [SpecialOfferController],
  providers: [SpecialOfferService],
  exports: [SpecialOfferService], // Export SpecialOfferService for use in VoucherModule
})
export class SpecialOfferModule {}
