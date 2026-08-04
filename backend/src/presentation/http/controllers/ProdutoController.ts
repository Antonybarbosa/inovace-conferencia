import { Request, Response } from 'express';
import { ConsultarProdutosUseCase } from '../../../application/use-cases/produtos/ConsultarProdutosUseCase.js';
import { ConsultarEstoqueUseCase } from '../../../application/use-cases/produtos/ConsultarEstoqueUseCase.js';

/**
 * Controller de Produtos
 * Traduz HTTP requests em chamadas aos use cases de consulta de produtos
 */
export class ProdutoController {
  constructor(
    private readonly consultarProdutosUseCase: ConsultarProdutosUseCase,
    private readonly consultarEstoqueUseCase: ConsultarEstoqueUseCase,
  ) {}

  /**
   * GET /api/produtos?q=termo&limite=50
   * Busca produtos por código ou descrição (LIKE)
   */
  async buscar(req: Request, res: Response): Promise<void> {
    try {
      const q = req.query.q as string | undefined;
      const limite = req.query.limite ? parseInt(req.query.limite as string, 10) : undefined;

      if (!q || !q.trim()) {
        res.status(400).json({ error: 'Parâmetro "q" é obrigatório' });
        return;
      }

      const result = await this.consultarProdutosUseCase.execute(
        { termo: q, limite },
        req.correlationId,
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ Erro em /produtos:', error.message);
      res.status(500).json({ error: error.message || 'Erro ao consultar produtos' });
    }
  }

  /**
   * GET /api/produtos/:codProd/estoque
   * Consulta saldo de estoque do produto por empresa, local e lote
   */
  async estoque(req: Request, res: Response): Promise<void> {
    try {
      const { codProd } = req.params;

      if (!codProd) {
        res.status(400).json({ error: 'codProd é obrigatório' });
        return;
      }

      const result = await this.consultarEstoqueUseCase.execute(
        { codProd },
        req.correlationId,
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ Erro em /produtos/estoque:', error.message);
      res.status(500).json({ error: error.message || 'Erro ao consultar estoque' });
    }
  }
}
