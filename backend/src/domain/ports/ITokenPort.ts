/**
 * Port (interface) para gerenciamento de tokens de sessão (JWT)
 * A implementação concreta fica na camada de infraestrutura
 */
export interface SessionPayload {
  userId: string;
  username: string;
  email: string;
}

export interface ITokenPort {
  generate(payload: SessionPayload): string;
  verify(token: string): SessionPayload;
  extractFromHeader(authHeader?: string): SessionPayload | null;
}
