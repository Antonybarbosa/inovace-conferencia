import { useState, useCallback, useRef } from 'react';
import { Produto, EstoqueItem } from '../../domain/models/Produto';
import { ProdutoApiService } from '../../infrastructure/api/ProdutoApiService';

const service = new ProdutoApiService();

/**
 * Hook para consulta de produtos e estoque.
 *
 * A busca de produtos é sob demanda (digitação), e a de estoque é disparada
 * ao clicar no botão de expandir de um produto específico.
 *
 * Controle de race condition via `termoAtual` / `codProdAtual` para ignorar
 * respostas defasadas.
 */
export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [estoqueMap, setEstoqueMap] = useState<Record<string, EstoqueItem[]>>({});
  const [loadingEstoque, setLoadingEstoque] = useState<Set<string>>(new Set());

  const termoAtual = useRef('');
  const codProdEstoqueAtual = useRef('');

  const buscar = useCallback(async (termo: string) => {
    if (!termo.trim()) {
      setProdutos([]);
      setError(null);
      return;
    }

    termoAtual.current = termo;
    setLoading(true);
    setError(null);

    try {
      const data = await service.buscarProdutos(termo);
      if (termoAtual.current !== termo) return;
      setProdutos(data);
      setEstoqueMap({});
    } catch (err: any) {
      if (termoAtual.current !== termo) return;
      setError(err.response?.data?.error || err.message || 'Erro ao consultar produtos');
      setProdutos([]);
    } finally {
      if (termoAtual.current === termo) setLoading(false);
    }
  }, []);

  const consultarEstoque = useCallback(async (codProd: string) => {
    if (estoqueMap[codProd]) return;

    codProdEstoqueAtual.current = codProd;
    setLoadingEstoque((prev) => new Set(prev).add(codProd));

    try {
      const data = await service.consultarEstoque(codProd);
      if (codProdEstoqueAtual.current !== codProd) return;
      setEstoqueMap((prev) => ({ ...prev, [codProd]: data }));
    } catch (err: any) {
      setEstoqueMap((prev) => ({
        ...prev,
        [codProd]: [],
      }));
      console.error('Erro ao consultar estoque:', err.message);
    } finally {
      setLoadingEstoque((prev) => {
        const next = new Set(prev);
        next.delete(codProd);
        return next;
      });
    }
  }, [estoqueMap]);

  return { produtos, loading, error, buscar, estoqueMap, loadingEstoque, consultarEstoque };
}
