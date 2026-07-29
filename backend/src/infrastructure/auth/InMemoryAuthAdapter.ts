import { IAuthPort } from '../../domain/ports/IAuthPort.js';
import { User } from '../../domain/entities/User.js';

/**
 * Adapter de autenticação em memória (para desenvolvimento)
 * Em produção, substituir por uma implementação contra banco de dados
 */
export class InMemoryAuthAdapter implements IAuthPort {
  async validateCredentials(username: string, password: string): Promise<User | null> {
    // TODO: Implementar validação real contra banco de dados
    // Por enquanto, aceita qualquer combinação de username/password
    if (!username || !password) {
      return null;
    }

    return new User({
      id: '1',
      username,
      email: `${username}@example.com`,
    });
  }
}
