import jwt from 'jsonwebtoken';
import { ITokenPort, SessionPayload } from '../../domain/ports/ITokenPort.js';

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

/**
 * Adapter concreto para gerenciamento de tokens JWT
 * Implementa o ITokenPort definido no domínio
 */
export class JwtTokenAdapter implements ITokenPort {
  constructor(private readonly config: JwtConfig) {}

  generate(payload: SessionPayload): string {
    return jwt.sign(payload, this.config.secret, {
      expiresIn: this.config.expiresIn as any,
      algorithm: 'HS256',
    });
  }

  verify(token: string): SessionPayload {
    const decoded = jwt.verify(token, this.config.secret, {
      algorithms: ['HS256'],
    }) as SessionPayload;

    return {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
    };
  }

  extractFromHeader(authHeader?: string): SessionPayload | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);

    try {
      return this.verify(token);
    } catch {
      return null;
    }
  }
}
