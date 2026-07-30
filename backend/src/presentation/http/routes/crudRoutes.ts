import { Router } from 'express';
import { CrudController } from '../controllers/CrudController.js';

/**
 * Factory de rotas CRUD
 */
export function createCrudRoutes(controller: CrudController): Router {
  const router = Router();

  router.post('/list/:entity', (req, res) => controller.listRecords(req, res));
  router.post('/load/:entity', (req, res) => controller.loadRecord(req, res));
  router.post('/save/:entity', (req, res) => controller.saveRecord(req, res));
  router.post('/delete/:entity', (req, res) => controller.removeRecord(req, res));
  router.post('/view/:viewName', (req, res) => controller.loadView(req, res));
  router.get('/entities', (req, res) => controller.listEntities(req, res));
  router.get('/produto/:codProd/imagem', (req, res) => controller.produtoImagem(req, res));

  return router;
}
