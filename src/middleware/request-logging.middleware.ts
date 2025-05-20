import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger('Request');
  }
  use(req: Request, res: Response, next: NextFunction) {
    const { body, query, path, method } = req;
    this.logger.log(
      `客戶端請求訊息: [path] ${method} ${path} , [Request Data] body: ${JSON.stringify(
        body,
      )}, query: ${JSON.stringify(query)}`,
    );

    next();
  }
}
