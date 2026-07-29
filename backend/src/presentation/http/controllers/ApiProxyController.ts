import { Request, Response } from 'express';
import { GatewayProxyUseCase } from '../../../application/use-cases/proxy/GatewayProxyUseCase.js';

/**
 * Controller de Proxy para APIs do Gateway
 * Encaminha requisições para endpoints REST do Sankhya
 */
export class ApiProxyController {
  constructor(private readonly proxyUseCase: GatewayProxyUseCase) {}

  async getProdutos(req: Request, res: Response): Promise<void> {
    await this.proxyGet('/produtos', req, res);
  }

  async getProdutoById(req: Request, res: Response): Promise<void> {
    await this.proxyGet(`/produtos/${req.params.id}`, req, res);
  }

  async getClientes(req: Request, res: Response): Promise<void> {
    await this.proxyGet('/parceiros/clientes', req, res);
  }

  async getPedidos(req: Request, res: Response): Promise<void> {
    await this.proxyGet('/vendas/pedidos', req, res);
  }

  async getPedidoById(req: Request, res: Response): Promise<void> {
    await this.proxyGet(`/vendas/pedidos/${req.params.id}`, req, res);
  }

  async createPedido(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.proxyUseCase.execute({
        method: 'post',
        endpoint: '/vendas/pedidos',
        data: req.body,
        correlationId: req.correlationId,
      });

      res.status(201).json(result.data);
    } catch (error: any) {
      console.error('❌ Erro ao criar pedido:', error.message);
      res.status(500).json({ error: 'Erro ao criar pedido' });
    }
  }

  async updatePedido(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.proxyUseCase.execute({
        method: 'put',
        endpoint: `/vendas/pedidos/${req.params.id}`,
        data: req.body,
        correlationId: req.correlationId,
      });

      res.status(200).json(result.data);
    } catch (error: any) {
      console.error('❌ Erro ao atualizar pedido:', error.message);
      res.status(500).json({ error: 'Erro ao atualizar pedido' });
    }
  }

  async getReceitas(req: Request, res: Response): Promise<void> {
    await this.proxyGet('/financeiros/receitas', req, res);
  }

  private async proxyGet(endpoint: string, req: Request, res: Response): Promise<void> {
    try {
      const result = await this.proxyUseCase.execute({
        method: 'get',
        endpoint,
        correlationId: req.correlationId,
      });

      res.status(200).json(result.data);
    } catch (error: any) {
      console.error(`❌ Erro ao acessar ${endpoint}:`, error.message);
      res.status(500).json({ error: `Erro ao acessar ${endpoint}` });
    }
  }
}
