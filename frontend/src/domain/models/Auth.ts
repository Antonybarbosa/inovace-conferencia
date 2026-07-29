export interface UserSession {
  codUsu: number;
  nomeUsu: string;
  jsessionid: string;
}

export interface LoginResponse {
  token: string;
  user: UserSession;
}
