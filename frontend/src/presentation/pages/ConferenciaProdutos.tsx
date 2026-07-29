import { useState, useEffect, useRef, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConferenciaAtiva } from '../../application/hooks/useConferenciaAtiva';
import { Botao, Campo, Container, Grid, Label, Painel } from '../components';
import { Loading } from '../components/Loading/Loading';

export function ConferenciaProdutosPage() {
  const { nunota } = useParams<{ nunota: string }>();
  const navigate = useNavigate();
  const nuNotaNum = parseInt(nunota || '0', 10);

  const {
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
    setError,
  } = useConferenciaAtiva(nuNotaNum);

  const [codBarra, setCodBarra] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [conferindo, setConferindo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nuNotaNum) iniciar();
  }, [nuNotaNum, iniciar]);

  useEffect(() => {
    if (conferencia && inputRef.current) inputRef.current.focus();
  }, [conferencia]);

  async function handleBuscarProduto(e: FormEvent) {
    e.preventDefault();
    if (!codBarra.trim()) return;
    try { await buscarProduto(codBarra.trim()); } catch { /* hook trata */ }
  }

  async function handleConferir() {
    if (!codBarra.trim()) return;
    setConferindo(true);
    try {
      const qtd = parseFloat(quantidade).toFixed(9);
      await conferirItem(codBarra.trim(), qtd);
      setCodBarra('');
      setQuantidade('1');
      inputRef.current?.focus();
    } catch { /* hook trata */ }
    finally { setConferindo(false); }
  }

  async function handleFinalizar() {
    if (!confirm('Deseja finalizar a conferência?')) return;
    try { await finalizar(); navigate('/conferencias'); }
    catch { /* hook trata */ }
  }

  const totalItens = itens.length;
  const itensConferidos = itens.filter((i) => parseFloat(i.qtdConf) > 0).length;
  const itensPendentes = totalItens - itensConferidos;

  if (loading && !conferencia) {
    return <Loading fullscreen mensagem="Iniciando conferência..." />;
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <Botao variant="ghost" size="sm" onClick={() => navigate('/conferencias')}>← Voltar</Botao>
        <div className="header-info">
          <h1>Conferência #{conferencia?.numConf}</h1>
          <span className="nota-info">Nota {conferencia?.numNota} — {conferencia?.parceiro}</span>
        </div>
      </header>

      {/* Resumo */}
      <Painel>
        <Grid cols={3} gap="md">
          <Container variant="default" padding="md" className="resumo-card">
            <Label variant="value">{totalItens}</Label>
            <Label variant="caption">Total</Label>
          </Container>
          <Container variant="default" padding="md" className="resumo-card conferido">
            <Label variant="value" className="text-success">{itensConferidos}</Label>
            <Label variant="caption">Conferidos</Label>
          </Container>
          <Container variant="default" padding="md" className="resumo-card pendente">
            <Label variant="value" className="text-warning">{itensPendentes}</Label>
            <Label variant="caption">Pendentes</Label>
          </Container>
        </Grid>
      </Painel>

      {/* Scanner */}
      <Painel titulo="Conferir Produto">
        <Container variant="scanner" padding="md">
          <form onSubmit={handleBuscarProduto} className="scanner-form-inner">
            <Campo
              ref={inputRef}
              variant="scanner"
              value={codBarra}
              onChange={(e) => setCodBarra(e.target.value)}
              placeholder="Escanear ou digitar código de barras..."
              autoFocus
            />
            <Campo
              variant="compact"
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              min="1"
              step="1"
            />
            <Botao
              type="button"
              variant="primary"
              size="lg"
              onClick={handleConferir}
              disabled={conferindo || !codBarra.trim()}
              loading={conferindo}
            >
              Conferir
            </Botao>
          </form>
        </Container>
      </Painel>

      {/* Feedback */}
      {error && <div className="error-message" onClick={() => setError(null)}>{error}</div>}

      {produtoAtual && (
        <Container variant="default" padding="sm" className="feedback-success">
          <strong>{produtoAtual.descrProd}</strong>
          <Label variant="caption">Cod: {produtoAtual.codProd}</Label>
        </Container>
      )}

      {ultimoConferido && (
        <Container variant="default" padding="sm" className="feedback-info">
          Conferido: {ultimoConferido.descrProd} ({ultimoConferido.codVol})
        </Container>
      )}

      {/* Tabela de Itens */}
      <Painel titulo="Itens do Pedido" subtitulo={`${itensConferidos} de ${totalItens} conferidos`}>
        <Container variant="outlined" padding="none">
          <table className="tabela-itens">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Pedido</th>
                <th>Conferido</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => {
                const qtdPed = parseFloat(item.qtdPed);
                const qtdConf = parseFloat(item.qtdConf);
                const completo = qtdConf >= qtdPed;
                const parcial = qtdConf > 0 && qtdConf < qtdPed;

                return (
                  <tr key={item.codProd} className={completo ? 'row-ok' : parcial ? 'row-parcial' : ''}>
                    <td>
                      <div className="produto-cell">
                        <span className="produto-desc">{item.descrProd || `Cod ${item.codProd}`}</span>
                        <span className="produto-barra">{item.codBarra || item.referencia || '-'}</span>
                      </div>
                    </td>
                    <td className="num-cell">{qtdPed}</td>
                    <td className="num-cell">{qtdConf}</td>
                    <td>
                      {completo && <span className="status-ok">OK</span>}
                      {parcial && <span className="status-parcial">Parcial</span>}
                      {!completo && !parcial && <span className="status-pendente">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Container>
      </Painel>

      {/* Ação finalizar */}
      <Painel>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Botao variant="success" size="lg" onClick={handleFinalizar} disabled={loading}>
            Finalizar Conferência
          </Botao>
        </div>
      </Painel>
    </div>
  );
}
