// src/common/exceptions/custom-throttler.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomThrottlerException extends HttpException {
  constructor() {
    // Custom message and status code for rate limit exceeded
    super('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
  }
}
