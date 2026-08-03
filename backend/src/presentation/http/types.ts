/**
 * Extensão de tipos do Express
 * Adiciona propriedades customizadas ao Request
 */
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      startTime?: number;
      userId?: string;
      /** Login Sankhya do usuário autenticado, extraído do JWT */
      username?: string;
    }
  }
}

export {};
