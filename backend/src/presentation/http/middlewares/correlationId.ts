import { Request, Response, NextFunction } from 'express';
import { CorrelationId } from '../../../domain/value-objects/CorrelationId.js';

/**
 * Middleware que gera/propaga Correlation ID em cada requisição
 */
export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existing = req.headers['x-correlation-id'] as string | undefined;
  const correlationId = CorrelationId.create(existing);

  req.correlationId = correlationId.toString();
  req.startTime = Date.now();

  res.setHeader('X-Correlation-ID', req.correlationId);

  next();
}
