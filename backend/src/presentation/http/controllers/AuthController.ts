import { Request, Response } from 'express';
import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase.js';
import { LoginSankhyaUseCase } from '../../../application/use-cases/auth/LoginSankhyaUseCase.js';
import { LogoutUseCase } from '../../../application/use-cases/auth/LogoutUseCase.js';
import { ValidateSessionUseCase } from '../../../application/use-cases/auth/ValidateSessionUseCase.js';
import { AppError } from '../../../domain/errors/AppError.js';

/**
 * Controller de Autenticação
 * Traduz HTTP requests em chamadas aos use cases
 */
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly loginSankhyaUseCase: LoginSankhyaUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly validateSessionUseCase: ValidateSessionUseCase,
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      const result = await this.loginUseCase.execute({ username, password });
      res.status(200).json(result);
    } catch (error: any) {
      const status = error.message.includes('obrigatórios') ? 400 : 401;
      res.status(status).json({ error: error.message });
    }
  }

  /** POST /auth/sankhya-login — Login via usuário Sankhya (MobileLoginSP) */
  async loginSankhya(req: Request, res: Response): Promise<void> {
    try {
      const { usuario, senha } = req.body;
      const result = await this.loginSankhyaUseCase.execute({ usuario, senha });
      res.status(200).json(result);
    } catch (error: unknown) {
      // Cada tipo de falha tem seu próprio status e código, para o frontend
      // poder dizer ao usuário se o problema é a senha dele ou o Sankhya.
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          codigo: error.codigo,
        });
        return;
      }

      console.error('[AuthController] Erro não classificado no login:', error);
      res.status(500).json({
        error: 'Erro inesperado ao processar o login',
        codigo: 'ERRO_INTERNO',
      });
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.logoutUseCase.execute();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao fazer logout' });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      const result = this.validateSessionUseCase.execute({
        authHeader: req.headers.authorization,
      });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}
