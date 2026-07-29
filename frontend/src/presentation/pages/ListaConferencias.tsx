import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../application/contexts/AuthContext';
import { useConferencias } from '../../application/hooks/useConferencias';
import { Botao, Container, Painel, Label } from '../components';
import { FiltrosDinamicos } from '../components/FiltrosDinamicos/FiltrosDinamicos';
import { Loading } from '../components/Loading/Loading';
import { PedidoConferencia } from '../../domain/models/Conferencia';
import { useState, useEffect } from 'react';

export function ListaConferenciasPage() {
  const { user, logout } = useAuth();
  const { pedidos, loading, error, recarregar } = useConferencias();
  const [pedidosFiltrados, setPedidosFiltrados] = useState<PedidoConferencia[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setPedidosFiltrados(pedidos);
  }, [pedidos]);

  function handleAbrirConferencia(nunota: number) {
    navigate(`/conferencias/${nunota}`);
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <h1>Conferências de Saída</h1>
        <div className="header-actions">
          <span className="user-info">{user?.nomeUsu}</span>
          <Botao variant="ghost" size="sm" onClick={logout}>Sair</Botao>
        </div>
      </header>

      {/* Toolbar */}
      <Container variant="default" padding="sm" className="toolbar-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Botao variant="secondary" size="sm" onClick={recarregar} loading={loading}>
            Atualizar
          </Botao>
          <Label variant="caption">{pedidosFiltrados.length} de {pedidos.length} pedidos</Label>
        </div>
      </Container>

      {/* Erro */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading */}
      {loading && <Loading mensagem="Carregando conferências..." />}

      {/* Filtros dinâmicos */}
      {!loading && (
        <FiltrosDinamicos
          dados={pedidos}
          onFiltrar={setPedidosFiltrados}
        />
      )}

      {/* Lista */}
      {!loading && (
        <Painel titulo="Pedidos Pendentes" className="lista-painel">
        <div className="lista-conferencias">
          {pedidosFiltrados.map((pedido) => (
            <Container
              key={pedido.nunota}
              variant="outlined"
              padding="md"
              className={`card-conferencia ${pedido.statusConferencia === 'Em andamento' ? 'em-andamento' : ''}`}
            >
              <div
                onDoubleClick={() => handleAbrirConferencia(pedido.nunota)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleAbrirConferencia(pedido.nunota)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-header">
                  <div className="card-header-left">
                    <Label variant="title">Nota {pedido.numNota}</Label>
                    <span className="card-nunota">#{pedido.nunota}</span>
                    <span className="card-parceiro">{pedido.parceiro}</span>
                  </div>
                  <span className={`status-badge ${pedido.statusConferencia === 'Em andamento' ? 'badge-warning' : 'badge-pending'}`}>
                    {pedido.statusConferencia}
                  </span>
                </div>

                <div className="card-body-compact">
                  <div className="card-metrics-inline">
                    <span><strong>Rota:</strong> {pedido.rotaEntrega || '-'}</span>
                    <span><strong>Vol:</strong> {pedido.qtdVolumes || 0}</span>
                    <span><strong>Prod:</strong> {pedido.qtdProdutosDistintos}</span>
                    <span><strong>OC:</strong> {pedido.ordemCarga || '-'}</span>
                    <span><strong>Transp:</strong> {pedido.transportadora || '-'}</span>
                    {pedido.usuarioConferente && (
                      <span><strong>Conferente:</strong> {pedido.usuarioConferente}</span>
                    )}
                  </div>
                  {pedido.obsPedido && (
                    <span className="card-obs-inline">{pedido.obsPedido}</span>
                  )}
                </div>
              </div>
            </Container>
          ))}

          {!loading && pedidosFiltrados.length === 0 && (
            <div className="empty-state">
              <p>Nenhum pedido pendente de conferência</p>
            </div>
          )}
        </div>
      </Painel>
      )}
    </div>
  );
}
