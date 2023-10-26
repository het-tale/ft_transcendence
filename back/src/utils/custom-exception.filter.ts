import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class CustomExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    let status = HttpStatus.BAD_REQUEST;
    let message = 'Bad Request';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse()['message'] || message;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
