/**
 * DTOs para operações de autenticação
 */

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginOutput {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface ValidateSessionInput {
  authHeader?: string;
}

export interface ValidateSessionOutput {
  user: {
    userId: string;
    username: string;
    email: string;
  };
}
