import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UserSession } from '../../domain/models/Auth';
import { AuthApiService } from '../../infrastructure/api/AuthApiService';

interface AuthContextData {
  user: UserSession | null;
  isAuthenticated: boolean;
  login(usuario: string, senha: string): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const authService = new AuthApiService();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => {
    const stored = authService.getUser();
    if (!stored) return null;
    return { codUsu: stored.codUsu, nomeUsu: stored.nomeUsu, jsessionid: '' };
  });

  const isAuthenticated = !!user && !!authService.getToken();

  const login = useCallback(async (usuario: string, senha: string) => {
    const response = await authService.loginSankhya(usuario, senha);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
