import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';

/**
 * Factory de rotas de autenticação
 */
export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post('/login', (req, res) => controller.login(req, res));
  router.post('/sankhya-login', (req, res) => controller.loginSankhya(req, res));
  router.post('/logout', (req, res) => controller.logout(req, res));
  router.get('/me', (req, res) => controller.me(req, res));

  return router;
}
