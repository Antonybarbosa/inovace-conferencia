import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de logging estruturado por requisição
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - (req.startTime || 0);

    const log = {
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId,
      method: req.method,
      endpoint: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.userId || 'anonymous',
    };

    if (res.statusCode >= 400) {
      console.error('❌', log);
    } else {
      console.log('✅', log);
    }

    return originalSend.call(this, data);
  };

  next();
}
