import { useState, useEffect, useCallback } from 'react';
import { PedidoConferencia } from '../../domain/models/Conferencia';
import { ConferenciaApiService } from '../../infrastructure/api/ConferenciaApiService';

const service = new ConferenciaApiService();

export function useConferencias() {
  const [pedidos, setPedidos] = useState<PedidoConferencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.listarPedidos();
      setPedidos(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao carregar conferências');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { pedidos, loading, error, recarregar: carregar };
}
