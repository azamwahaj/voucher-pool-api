// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler'; // Corrected import path
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from './throttler-guard'; // Custom ThrottlerGuard

// Import entity modules and other modules as they are created
import { Customer } from './customer/entities/customer.entity';
import { SpecialOffer } from './special-offer/entities/special-offer.entity';
import { Voucher } from './voucher/entities/voucher.entity';
import { CustomerModule } from './customer/customer.module';
import { SpecialOfferModule } from './special-offer/special-offer.module';
import { VoucherModule } from './voucher/voucher.module';

@Module({
  imports: [
    // Configure ConfigModule to load environment variables
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigService available globally
      envFilePath: '.env', // Specify the path to your .env file
    }),
    // Configure ThrottlerModule for rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Promise<ThrottlerModuleOptions> => Promise.resolve({
        throttlers: [ // Define the throttlers array as required
          {
            ttl: configService.get<number>('THROTTLER_TTL') || 60, // Time to live for records in seconds
            limit: configService.get<number>('THROTTLER_LIMIT') || 100, // Max requests within the TTL
          },
        ],
      }),
    }),
    // Configure TypeORM for database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [Customer, SpecialOffer, Voucher], // List all entities here
        synchronize: true, // WARNING: Set to false in production to handle migrations manually
        logging: ['query', 'error'], // Log database queries and errors
      }),
    }),
    CustomerModule,
    SpecialOfferModule,
    VoucherModule,
  ],
  providers: [
    // Apply ThrottlerGuard globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
