import { Router } from 'express';
import { ApiProxyController } from '../controllers/ApiProxyController.js';

/**
 * Factory de rotas de API (proxy para Gateway)
 */
export function createApiRoutes(controller: ApiProxyController): Router {
  const router = Router();

  // Produtos
  router.get('/produtos', (req, res) => controller.getProdutos(req, res));
  router.get('/produtos/:id', (req, res) => controller.getProdutoById(req, res));

  // Clientes
  router.get('/parceiros/clientes', (req, res) => controller.getClientes(req, res));

  // Pedidos
  router.get('/vendas/pedidos', (req, res) => controller.getPedidos(req, res));
  router.get('/vendas/pedidos/:id', (req, res) => controller.getPedidoById(req, res));
  router.post('/vendas/pedidos', (req, res) => controller.createPedido(req, res));
  router.put('/vendas/pedidos/:id', (req, res) => controller.updatePedido(req, res));

  // Financeiro
  router.get('/financeiros/receitas', (req, res) => controller.getReceitas(req, res));

  return router;
}
