import { ArgumentsHost, Catch, ExceptionFilter, HttpException, INestApplication, ValidationPipe } from '@nestjs/common';
import { STATUS_CODES } from 'node:http';
import { Request, Response } from 'express';

// Keep the Spring error envelope for existing API consumers.
@Catch(HttpException)
class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const status = exception.getStatus();
    const body = exception.getResponse();
    const message = typeof body === 'string' ? body : (body as { message?: string | string[] }).message;
    context.getResponse<Response>().status(status).json({
      timestamp: new Date().toISOString(),
      status,
      error: STATUS_CODES[status],
      message: Array.isArray(message) ? message.join('; ') : message,
      path: context.getRequest<Request>().originalUrl.split('?')[0],
    });
  }
}

export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new ApiExceptionFilter());
}
