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
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [qtdVolumes, setQtdVolumes] = useState('1');
  const [imagemAmpliada, setImagemAmpliada] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nuNotaNum) iniciar();
  }, [nuNotaNum, iniciar]);

  useEffect(() => {
    if (conferencia && inputRef.current) inputRef.current.focus();
  }, [conferencia]);

  async function handleBuscarProduto(e: FormEvent) {
    e.preventDefault();
    if (!codBarra.trim() || conferindo) return;
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

  async function handleConferir() {
    if (!codBarra.trim() || conferindo) return;
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
    try {
      await finalizar(0, parseInt(qtdVolumes) || 0);
      setShowFinalizarModal(false);
      navigate('/conferencias');
    } catch { /* hook trata */ }
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
        <Botao variant="success" size="sm" onClick={() => setShowFinalizarModal(true)} disabled={loading}>
          Finalizar
        </Botao>
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
              type="submit"
              variant="primary"
              size="lg"
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
      <Painel titulo="Itens Pendentes" subtitulo={`${itensPendentes} restantes`}>
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
              {itens.filter(i => parseFloat(i.qtdConf) < parseFloat(i.qtdPed)).sort((a, b) => {
                // Parciais primeiro (qtdConf > 0), depois pendentes (qtdConf = 0)
                const confA = parseFloat(a.qtdConf);
                const confB = parseFloat(b.qtdConf);
                if (confA > 0 && confB === 0) return -1;
                if (confA === 0 && confB > 0) return 1;
                return 0;
              }).map((item) => {
                const qtdPed = parseFloat(item.qtdPed);
                const qtdConf = parseFloat(item.qtdConf);
                const parcial = qtdConf > 0 && qtdConf < qtdPed;

                return (
                  <tr key={item.sequencia} className={parcial ? 'row-parcial' : ''}>
                    <td>
                      <div className="produto-cell">
                        <img
                          src={`/api/crud/produto/${item.codProd}/imagem`}
                          alt={item.descrProd || ''}
                          className="produto-img"
                          onClick={() => setImagemAmpliada(`/api/crud/produto/${item.codProd}/imagem`)}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div>
                          <span className="produto-desc">{item.descrProd || `Cod ${item.codProd}`}</span>
                          <span className="produto-barra">{item.codProd} | {item.codBarra || '-'} | Ref: {item.referencia || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="num-cell">{qtdPed}</td>
                    <td className="num-cell">{qtdConf}</td>
                    <td>
                      {parcial && <span className="status-parcial">Parcial</span>}
                      {!parcial && <span className="status-pendente">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Container>
      </Painel>

      {/* Itens conferidos */}
      {itens.filter(i => parseFloat(i.qtdConf) > 0).length > 0 && (
        <Painel titulo="Itens Conferidos" subtitulo={`${itens.filter(i => parseFloat(i.qtdConf) > 0).length} com conferência`}>
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
                {itens.filter(i => parseFloat(i.qtdConf) > 0).sort((a, b) => {
                  // OK (completos) primeiro, depois parciais
                  const completoA = parseFloat(a.qtdConf) >= parseFloat(a.qtdPed) ? 1 : 0;
                  const completoB = parseFloat(b.qtdConf) >= parseFloat(b.qtdPed) ? 1 : 0;
                  return completoB - completoA;
                }).map((item) => {
                  const qtdPed = parseFloat(item.qtdPed);
                  const qtdConf = parseFloat(item.qtdConf);
                  const completo = qtdConf >= qtdPed;

                  return (
                    <tr key={item.sequencia} className={completo ? 'row-ok' : 'row-parcial'}>
                      <td>
                        <div className="produto-cell">
                          <img
                            src={`/api/crud/produto/${item.codProd}/imagem`}
                            alt={item.descrProd || ''}
                            className="produto-img"
                            onClick={() => setImagemAmpliada(`/api/crud/produto/${item.codProd}/imagem`)}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div>
                            <span className="produto-desc">{item.descrProd || `Cod ${item.codProd}`}</span>
                            <span className="produto-barra">{item.codProd} | {item.codBarra || '-'} | Ref: {item.referencia || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="num-cell">{qtdPed}</td>
                      <td className="num-cell">{qtdConf}</td>
                      <td>
                        {completo ? <span className="status-ok">OK</span> : <span className="status-parcial">Parcial</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Container>
        </Painel>
      )}

      {/* Modal finalizar */}
      {showFinalizarModal && (
        <div className="modal-overlay" onClick={() => setShowFinalizarModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Finalizar Conferência</h2>
            <p className="modal-subtitle">Informe a quantidade de volumes para este pedido.</p>
            <div style={{ margin: '20px 0' }}>
              <Campo
                label="Quantidade de Volumes"
                type="number"
                value={qtdVolumes}
                onChange={(e) => setQtdVolumes(e.target.value)}
                min="0"
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <Botao variant="secondary" size="md" onClick={() => setShowFinalizarModal(false)}>
                Cancelar
              </Botao>
              <Botao variant="success" size="md" onClick={handleFinalizar} loading={loading}>
                Confirmar
              </Botao>
            </div>
          </div>
        </div>
      )}

      {/* Modal imagem ampliada */}
      {imagemAmpliada && (
        <div className="img-modal-overlay" onClick={() => setImagemAmpliada(null)}>
          <img src={imagemAmpliada} alt="Produto" className="img-modal" />
        </div>
      )}
    </div>
  );
}
