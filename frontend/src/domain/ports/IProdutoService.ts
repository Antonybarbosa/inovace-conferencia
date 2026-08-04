import { Produto, EstoqueItem } from '../models/Produto';

export interface IProdutoService {
  buscarProdutos(termo: string, limite?: number): Promise<Produto[]>;
  consultarEstoque(codProd: string): Promise<EstoqueItem[]>;
}
