import { Router } from 'express';
import { ProdutoController } from '../controllers/ProdutoController.js';

/**
 * Rotas de Consulta de Produtos
 *
 * GET /?q=termo&limite=50          → Busca produtos por código ou descrição
 * GET /:codProd/estoque            → Consulta saldo de estoque do produto
 */
export function createProdutoRoutes(controller: ProdutoController): Router {
  const router = Router();

  router.get('/estoque/:codProd', (req, res) => controller.estoque(req, res));
  router.get('/', (req, res) => controller.buscar(req, res));

  return router;
}
