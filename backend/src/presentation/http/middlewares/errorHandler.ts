import { Request, Response, NextFunction } from 'express';

/**
 * Middleware global de tratamento de erros
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error('❌ Erro não tratado:', {
    correlationId: req.correlationId,
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    error: 'Erro interno do servidor',
    correlationId: req.correlationId,
  });
}
