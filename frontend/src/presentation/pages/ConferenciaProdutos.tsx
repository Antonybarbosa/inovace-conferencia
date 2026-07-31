import { useState, useEffect, useRef, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConferenciaAtiva } from '../../application/hooks/useConferenciaAtiva';
import { useAuth } from '../../application/contexts/AuthContext';
import { podeVerCamposSensiveis } from '../../domain/permissions';
import { Botao, Campo, Container, Grid, Label, Painel } from '../components';
import { Loading } from '../components/Loading/Loading';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export function ConferenciaProdutosPage() {
  const { nunota } = useParams<{ nunota: string }>();
  const navigate = useNavigate();
  const nuNotaNum = parseInt(nunota || '0', 10);
  const { user } = useAuth();
  const verCamposSensiveis = podeVerCamposSensiveis(user?.nomeUsu);

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
  const [showDivergenciaModal, setShowDivergenciaModal] = useState(false);
  const [qtdVolumes, setQtdVolumes] = useState('1');
  const [finalizando, setFinalizando] = useState(false);
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
    setFinalizando(true);
    try {
      // 1ª chamada: finalizar
      const resultado = await finalizar(0, parseInt(qtdVolumes) || 0);
      
      // Verificar se há divergência na resposta ou se há itens pendentes
      const pendentes = itens.filter(i => parseFloat(i.qtdConf) < parseFloat(i.qtdPed));
      if (pendentes.length > 0) {
        // Sankhya finalizou como divergente — mostrar modal
        setShowFinalizarModal(false);
        setShowDivergenciaModal(true);
      } else {
        // Sem divergência — finalizou OK
        setShowFinalizarModal(false);
        navigate('/conferencias', { state: { mensagem: `Pedido ${conferencia?.numNota} do cliente ${conferencia?.parceiro} finalizado com sucesso!` } });
      }
    } catch (err: any) {
      // Erro do Sankhya pode indicar divergência
      setShowFinalizarModal(false);
      setShowDivergenciaModal(true);
    } finally {
      setFinalizando(false);
    }
  }

  async function handleCortarDivergentes() {
    setFinalizando(true);
    try {
      // Chamar ConferenciaSP.cortar para cortar itens divergentes
      const service = new (await import('../../infrastructure/api/ConferenciaApiService')).ConferenciaApiService();
      await service.cortarNota(nuNotaNum, 0, parseInt(qtdVolumes) || 0);
      setShowDivergenciaModal(false);
      navigate('/conferencias', { state: { mensagem: `Pedido ${conferencia?.numNota} finalizado com corte de divergentes.` } });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao cortar divergentes');
      setShowDivergenciaModal(false);
    } finally {
      setFinalizando(false);
    }
  }

  async function handleConcluirDivergente() {
    setShowDivergenciaModal(false);
    navigate('/conferencias', { state: { mensagem: `Pedido ${conferencia?.numNota} finalizado como divergente.` } });
  }

  const totalItens = itens.length;
  const itensConferidos = itens.filter((i) => parseFloat(i.qtdConf) >= parseFloat(i.qtdPed)).length;
  const itensPendentes = totalItens - itensConferidos;

  if (loading && !conferencia) {
    return <Loading fullscreen mensagem="Iniciando conferência..." />;
  }

  return (
    <div className="page-container">
      <div className="conferencia-top-fixo">
      {/* Header */}
      <header className="page-header">
        <Botao variant="ghost" size="sm" onClick={() => navigate('/conferencias')}>← Voltar</Botao>
        <div className="header-info">
          <h1>Conferência #{conferencia?.numConf}</h1>
          <span className="nota-info">Pedido {conferencia?.numNota} — {conferencia?.parceiro}</span>
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
      </div>

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

      {/* Listas de itens - side by side em desktop */}
      <div className="itens-grid-desktop">
        {/* Itens Pendentes */}
        <Painel titulo="Itens Pendentes" subtitulo={`${itensPendentes} restantes`}>
        {itens.length === 0 && !error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <DotLottieReact
              src="https://lottie.host/f141a079-702f-4d37-88f7-c91b33722274/yQw3d1y8TG.lottie"
              autoplay
              loop
              style={{ width: '150px', height: '150px' }}
            />
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-500)', marginTop: '8px' }}>Carregando itens...</p>
          </div>
        ) : (
        <Container variant="outlined" padding="none">
          <table className="tabela-itens">
            <thead>
              <tr>
                <th>Produto</th>
                {verCamposSensiveis && <th>Pedido</th>}
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
                          <span className="produto-barra">
                            {verCamposSensiveis
                              ? `${item.codProd} | ${item.codBarra || '-'} | Ref: ${item.referencia || '-'}`
                              : item.codProd}
                          </span>
                        </div>
                      </div>
                    </td>
                    {verCamposSensiveis && <td className="num-cell">{qtdPed}</td>}
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
        )}
      </Painel>

      {/* Itens conferidos */}
      {itens.filter(i => parseFloat(i.qtdConf) > 0).length > 0 && (
        <Painel titulo="Itens Conferidos" subtitulo={`${itens.filter(i => parseFloat(i.qtdConf) > 0).length} com conferência`}>
          <Container variant="outlined" padding="none">
            <table className="tabela-itens">
              <thead>
                <tr>
                  <th>Produto</th>
                  {verCamposSensiveis && <th>Pedido</th>}
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
                            <span className="produto-barra">
                              {verCamposSensiveis
                                ? `${item.codProd} | ${item.codBarra || '-'} | Ref: ${item.referencia || '-'}`
                                : item.codProd}
                            </span>
                          </div>
                        </div>
                      </td>
                      {verCamposSensiveis && <td className="num-cell">{qtdPed}</td>}
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
      </div>

      {/* Modal divergência */}
      {showDivergenciaModal && (
        <div className="modal-overlay">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h2 className="modal-title">Conferência concluída</h2>
              <button className="modal-close" onClick={() => setShowDivergenciaModal(false)}>×</button>
            </div>
            <p className="modal-message-destaque">Conferência finalizada como divergente.</p>
            <div className="modal-actions-vertical">
              <Botao variant="secondary" size="md" fullWidth onClick={handleCortarDivergentes} loading={finalizando} disabled={finalizando}>
                ✂ Cortar itens divergentes
              </Botao>
              <Botao variant="primary" size="md" fullWidth onClick={handleConcluirDivergente} loading={finalizando} disabled={finalizando}>
                ✓ Concluir
              </Botao>
            </div>
          </div>
        </div>
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
