import { IProdutoService } from '../../domain/ports/IProdutoService';
import { Produto, EstoqueItem } from '../../domain/models/Produto';
import { httpClient } from './httpClient';

export class ProdutoApiService implements IProdutoService {
  async buscarProdutos(termo: string, limite?: number): Promise<Produto[]> {
    const response = await httpClient.get<{ records: Produto[] }>('/api/produtos', {
      params: { q: termo, ...(limite ? { limite } : {}) },
    });
    return response.data.records;
  }

  async consultarEstoque(codProd: string): Promise<EstoqueItem[]> {
    const response = await httpClient.get<{ records: EstoqueItem[] }>(
      `/api/produtos/estoque/${codProd}`,
    );
    return response.data.records;
  }
}
