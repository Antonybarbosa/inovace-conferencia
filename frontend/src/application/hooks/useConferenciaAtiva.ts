import { useState, useCallback } from 'react';
import {
  ItemPedido,
  ConferenciaIniciada,
  ProdutoConferencia,
  ItemConferidoResponse,
} from '../../domain/models/Conferencia';
import { ConferenciaApiService } from '../../infrastructure/api/ConferenciaApiService';
import { AuthApiService } from '../../infrastructure/api/AuthApiService';

const service = new ConferenciaApiService();
const authService = new AuthApiService();

export function useConferenciaAtiva(nuNota: number) {
  const [conferencia, setConferencia] = useState<ConferenciaIniciada | null>(null);
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [produtoAtual, setProdutoAtual] = useState<ProdutoConferencia | null>(null);
  const [ultimoConferido, setUltimoConferido] = useState<ItemConferidoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iniciar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const user = authService.getUser();
      const storedUser = localStorage.getItem('conferencia_user');
      const mgeSession = storedUser ? JSON.parse(storedUser)?.jsessionid : undefined;
      const conf = await service.iniciarConferencia(nuNota, user?.codUsu, user?.nomeUsu, mgeSession);
      setConferencia(conf);

      const { itens: itensPedido } = await service.listarItensPedido(nuNota);
      setItens(itensPedido);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao iniciar conferência');
    } finally {
      setLoading(false);
    }
  }, [nuNota]);

  const buscarProduto = useCallback(async (codBarra: string) => {
    try {
      setError(null);
      const produto = await service.getProduto(nuNota, codBarra);
      setProdutoAtual(produto);
      return produto;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Produto não encontrado';
      setError(msg);
      setProdutoAtual(null);
      throw new Error(msg);
    }
  }, [nuNota]);

  const conferirItem = useCallback(async (codBarra: string, qtdConf: string) => {
    if (!conferencia) throw new Error('Conferência não iniciada');

    try {
      setError(null);
      const resultado = await service.conferirItem({
        numConf: conferencia.numConf,
        nuNota,
        codBarra,
        qtdConf,
      });
      setUltimoConferido(resultado);

      // Atualizar lista de itens
      const { itens: itensAtualizados } = await service.listarItensPedido(nuNota);
      setItens(itensAtualizados);

      return resultado;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erro ao conferir item';
      setError(msg);
      throw new Error(msg);
    }
  }, [nuNota, conferencia]);

  const finalizar = useCallback(async (peso = 0, qtdVol = 0) => {
    if (!conferencia) throw new Error('Conferência não iniciada');

    try {
      setLoading(true);
      setError(null);
      await service.finalizarConferencia(conferencia.numConf, peso, qtdVol);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao finalizar');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [conferencia]);

  const recarregarItens = useCallback(async () => {
    const { itens: itensAtualizados } = await service.listarItensPedido(nuNota);
    setItens(itensAtualizados);
  }, [nuNota]);

  return {
    conferencia,
    itens,
    produtoAtual,
    ultimoConferido,
    loading,
    error,
    iniciar,
    buscarProduto,
    conferirItem,
    finalizar,
    recarregarItens,
    setError,
  };
}
