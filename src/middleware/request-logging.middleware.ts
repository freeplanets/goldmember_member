import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v1 as uuidv1 } from 'uuid';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger('Request');
  }
  use(req: Request, res: Response, next: NextFunction) {
    const { body, query, path, method, headers } = req;
    if (headers["x-amzn-trace-id"]) {
      req['traceId'] = headers["x-amzn-trace-id"];
    } else {
      req['traceId'] = uuidv1();
    }    
    this.logger.log(
      `客戶端請求訊息: [path] ${method} ${path} , [Request Data] body: ${JSON.stringify(
        body,
      )}, query: ${JSON.stringify(query)}`,
      req['traceId'],
    );
    next();
  }
}
