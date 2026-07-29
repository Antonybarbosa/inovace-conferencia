/**
 * Port (interface) para autenticação de usuários
 * Permite trocar a fonte de autenticação (memória, BD, LDAP, etc.)
 */
import { User } from '../entities/User.js';

export interface IAuthPort {
  validateCredentials(username: string, password: string): Promise<User | null>;
}
