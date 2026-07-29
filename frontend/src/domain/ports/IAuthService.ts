import { LoginResponse } from '../models/Auth';

export interface IAuthService {
  loginSankhya(usuario: string, senha: string): Promise<LoginResponse>;
  getToken(): string | null;
  logout(): void;
}
