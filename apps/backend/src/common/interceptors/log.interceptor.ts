import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger('HTTP');

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const now = Date.now();
    const method = req.method;
    const url = req.url;

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const delay = Date.now() - now;

        this.logger.log(`${method} ${url} ${statusCode} ${delay}ms`);
      }),
      catchError((error) => {
        const delay = Date.now() - now;
        const statusCode = error.getStatus?.() || 500;
        const errorMessage = error.message || 'Internal Server Error';
        const errorResponse = error.response ? JSON.stringify(error.response) : '';

        this.logger.error(
          `${method} ${url} ${statusCode} ${delay}ms - Error ${errorMessage} - Details ${errorResponse}`,
        );
        console.error('Detailed Error:', error);

        return new Observable<never>((subscriber) => subscriber.error(error));
      }),
    );
  }
}
