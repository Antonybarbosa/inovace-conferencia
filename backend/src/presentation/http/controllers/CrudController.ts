import { Request, Response } from 'express';
import { LoadRecordsUseCase } from '../../../application/use-cases/crud/LoadRecordsUseCase.js';
import { LoadRecordUseCase } from '../../../application/use-cases/crud/LoadRecordUseCase.js';
import { SaveRecordUseCase } from '../../../application/use-cases/crud/SaveRecordUseCase.js';
import { RemoveRecordUseCase } from '../../../application/use-cases/crud/RemoveRecordUseCase.js';
import { LoadViewUseCase } from '../../../application/use-cases/crud/LoadViewUseCase.js';
import { GetProdutoImagemUseCase } from '../../../application/use-cases/crud/GetProdutoImagemUseCase.js';

/**
 * Controller de CRUD genérico
 * Traduz HTTP requests em chamadas aos use cases de CRUD no formato Sankhya oficial
 */
export class CrudController {
  constructor(
    private readonly loadRecordsUseCase: LoadRecordsUseCase,
    private readonly loadRecordUseCase: LoadRecordUseCase,
    private readonly saveRecordUseCase: SaveRecordUseCase,
    private readonly removeRecordUseCase: RemoveRecordUseCase,
    private readonly loadViewUseCase: LoadViewUseCase,
    private readonly getProdutoImagemUseCase: GetProdutoImagemUseCase,
  ) {}

  /**
   * POST /crud/list/:entity
   * Body: { entity: [...], criteria?: {...}, offsetPage?: 0 }
   */
  async listRecords(req: Request, res: Response): Promise<void> {
    try {
      const { entity: rootEntity } = req.params;
      const { entity, criteria, offsetPage, includePresentationFields, orderBy } = req.body;

      if (!entity || !Array.isArray(entity) || entity.length === 0) {
        res.status(400).json({
          error: 'O campo "entity" é obrigatório e deve conter ao menos um item com path e fieldset.list',
        });
        return;
      }

      const result = await this.loadRecordsUseCase.execute(
        { rootEntity, entity, criteria, offsetPage, includePresentationFields, orderBy },
        req.correlationId,
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ Erro em /crud/list:', error.message);
      res.status(500).json({ error: error.message || 'Erro ao listar registros' });
    }
  }

  /**
   * POST /crud/load/:entity
   * Body: { entity: [...], primaryKey: { CAMPO: { $: "valor" } } }
   */
  async loadRecord(req: Request, res: Response): Promise<void> {
    try {
      const { entity: rootEntity } = req.params;
      const { entity, primaryKey } = req.body;

      if (!primaryKey) {
        res.status(400).json({ error: 'Chave primária (primaryKey) é obrigatória' });
        return;
      }

      if (!entity || !Array.isArray(entity)) {
        res.status(400).json({ error: 'O campo "entity" é obrigatório' });
        return;
      }

      const result = await this.loadRecordUseCase.execute(
        { rootEntity, entity, primaryKey },
        req.correlationId,
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ Erro em /crud/load:', error.message);
      res.status(500).json({ error: error.message || 'Erro ao carregar registro' });
    }
  }

  /**
   * POST /crud/save/:entity
   * Body: { data: { CAMPO: { $: "valor" }, ... } }
   */
  async saveRecord(req: Request, res: Response): Promise<void> {
    try {
      const { entity: rootEntity } = req.params;
      const { data } = req.body;

      if (!data || Object.keys(data).length === 0) {
        res.status(400).json({ error: 'Dados do registro (data) são obrigatórios' });
        return;
      }

      const result = await this.saveRecordUseCase.execute(
        { rootEntity, data },
        req.correlationId,
      );

      res.status(201).json(result);
    } catch (error: any) {
      console.error('❌ Erro em /crud/save:', error.message);
      res.status(500).json({ error: error.message || 'Erro ao salvar registro' });
    }
  }

  /**
   * POST /crud/delete/:entity
   * Body: { primaryKey: { CAMPO: { $: "valor" } } }
   */
  async removeRecord(req: Request, res: Response): Promise<void> {
    try {
      const { entity: rootEntity } = req.params;
      const { primaryKey } = req.body;

      if (!primaryKey) {
        res.status(400).json({ error: 'Chave primária (primaryKey) é obrigatória' });
        return;
      }

      const result = await this.removeRecordUseCase.execute(
        { rootEntity, primaryKey },
        req.correlationId,
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ Erro em /crud/delete:', error.message);
      res.status(500).json({ error: error.message || 'Erro ao deletar registro' });
    }
  }

  /**
   * POST /crud/view/:viewName
   * Body: { entity: [...], criteria?: {...}, offsetPage?: 0 }
   */
  async loadView(req: Request, res: Response): Promise<void> {
    try {
      const { viewName } = req.params;
      const { entity, criteria, offsetPage } = req.body;

      if (!entity || !Array.isArray(entity)) {
        res.status(400).json({ error: 'O campo "entity" é obrigatório' });
        return;
      }

      const result = await this.loadViewUseCase.execute(
        { viewName, entity, criteria, offsetPage },
        req.correlationId,
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ Erro em /crud/view:', error.message);
      res.status(500).json({ error: error.message || 'Erro ao carregar visão' });
    }
  }

  /** GET /crud/entities - Lista entidades disponíveis */
  listEntities(_req: Request, res: Response): void {
    res.status(200).json({
      entities: [
        'Parceiro', 'Produto', 'CabecalhoNota', 'ItemNota',
        'Conferencia', 'OrdemCarga', 'Rota', 'RotaParceiro',
      ],
      documentation: 'https://developer.sankhya.com.br/reference/get_loadrecords',
    });
  }

  /** GET /crud/produto/:codProd/imagem — Retorna imagem do produto via .dbimage */
  async produtoImagem(req: Request, res: Response): Promise<void> {
    try {
      const { codProd } = req.params;
      const imageBuffer = await this.getProdutoImagemUseCase.execute(codProd, req.correlationId);

      if (imageBuffer && imageBuffer.length > 0) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.status(200).send(imageBuffer);
      } else {
        res.status(404).json({ error: 'Imagem não disponível', codProd });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
