// src/throttler-guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard as NestThrottlerGuard } from '@nestjs/throttler';
import { CustomThrottlerException } from './common/exceptions/custom-throttler.exception';
// Changed import path for ThrottlerLimitDetail - it's typically exported directly from @nestjs/throttler
import { ThrottlerLimitDetail } from '@nestjs/throttler';

@Injectable()
export class ThrottlerGuard extends NestThrottlerGuard {
  // Updated signature to match the base class and return type
  protected async throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: ThrottlerLimitDetail): Promise<void> {
    // Throw a custom exception when rate limit is exceeded
    throw new CustomThrottlerException();
  }
}
