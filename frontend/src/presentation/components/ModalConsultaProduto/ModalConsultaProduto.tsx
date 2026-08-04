import { useState, useEffect, useCallback } from 'react';
import { useProdutos } from '../../../application/hooks/useProdutos';
import { Campo } from '../Campo/Campo';
import { Botao } from '../Botao/Botao';
import { Label } from '../Label/Label';
import { EstoqueItem } from '../../../domain/models/Produto';
import './ModalConsultaProduto.css';

interface ModalConsultaProdutoProps {
  aberto: boolean;
  onFechar: () => void;
}

function formatarData(data: string | null): string {
  if (!data) return '-';
  const match = data.match(/^(\d{2})(\d{2})(\d{4})/);
  if (!match) return data;
  return `${match[1]}/${match[2]}/${match[3]}`;
}

function EstoqueTable({ itens }: { itens: EstoqueItem[] }) {
  const totalGeral = itens.reduce((soma, item) => soma + item.estoque, 0);
  return (
    <div className="estoque-tabela-wrapper">
      <table className="estoque-tabela">
        <thead>
          <tr>
            <th>Emp</th>
            <th>Local</th>
            <th>Lote</th>
            <th className="num">Estoque</th>
            <th>Fabricação</th>
            <th>Validade</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item, i) => (
            <tr key={`${item.codEmp}-${item.codLocal}-${item.lote}-${i}`}>
              <td className="num">{item.codEmp}</td>
              <td>{item.local}</td>
              <td>{item.lote || '-'}</td>
              <td className="num">{item.estoque.toFixed(2)}</td>
              <td>{formatarData(item.dtFabricacao)}</td>
              <td>{formatarData(item.dtValidade)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="num"><strong>Total</strong></td>
            <td className="num"><strong>{totalGeral.toFixed(2)}</strong></td>
            <td colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function ModalConsultaProduto({ aberto, onFechar }: ModalConsultaProdutoProps) {
  const { produtos, loading, error, buscar, estoqueMap, loadingEstoque, consultarEstoque } = useProdutos();
  const [termo, setTermo] = useState('');
  const [expandido, setExpandido] = useState<string | null>(null);
  const [jaBuscou, setJaBuscou] = useState(false);

  const handleBuscar = useCallback(
    (valor: string) => {
      setTermo(valor);
    },
    [],
  );

  const handleBuscarClick = useCallback(
    (valor?: string) => {
      const termoBusca = valor ?? termo;
      if (!termoBusca.trim()) return;
      buscar(termoBusca);
      setExpandido(null);
      setJaBuscou(true);
    },
    [buscar, termo],
  );

  const toggleExpandir = useCallback(
    (codProd: string) => {
      if (expandido === codProd) {
        setExpandido(null);
      } else {
        setExpandido(codProd);
        if (!estoqueMap[codProd]) consultarEstoque(codProd);
      }
    },
    [expandido, estoqueMap, consultarEstoque],
  );

  useEffect(() => {
    if (!aberto) {
      setTermo('');
      buscar('');
      setExpandido(null);
      setJaBuscou(false);
    }
  }, [aberto, buscar]);

  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-card modal-produto-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <h2 className="modal-title">Consultar Produto</h2>
          <button className="modal-close" onClick={onFechar} aria-label="Fechar">×</button>
        </div>

        <p className="modal-subtitle">Busque por código ou descrição. Depois clique em "Estoque" para ver saldos por empresa, local e lote.</p>

        <div className="modal-produto-busca">
          <div className="modal-produto-busca-row">
            <Campo
              type="text"
              placeholder="Digite código ou descrição..."
              value={termo}
              onChange={(e) => handleBuscar(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleBuscarClick(); }}
              autoFocus
            />
            <Botao
              variant="primary"
              size="md"
              onClick={() => handleBuscarClick()}
              loading={loading}
              className="modal-produto-btn-buscar"
            >
              Buscar
            </Botao>
          </div>
        </div>

        {error && <div className="error-message modal-produto-error">{error}</div>}

        <div className="modal-produto-resultados">
          {loading && <p className="modal-produto-status">Buscando...</p>}

          {!loading && !error && produtos.length === 0 && jaBuscou && (
            <p className="modal-produto-status">Nenhum produto encontrado.</p>
          )}

          {!loading && produtos.length > 0 && (
            <>
              <Label variant="caption" className="modal-produto-contador">
                {produtos.length} produto(s) encontrado(s)
              </Label>
              <div className="modal-produto-lista">
                {produtos.map((p) => (
                  <div key={p.codProd} className="modal-produto-item-wrapper">
                    <div className="modal-produto-item">
                      <div className="modal-produto-item-info">
                        <span className="modal-produto-item-cod">{p.codProd}</span>
                        <span className="modal-produto-item-desc">{p.descrProd}</span>
                        <span className="modal-produto-item-meta">
                          {p.referencia && <>Ref: {p.referencia} · </>}
                          {p.codVol}
                        </span>
                      </div>
                      <div className="modal-produto-item-acoes">
                        <span className={`modal-produto-item-badge ${p.ativo === 'S' ? 'badge-ok' : 'badge-inativo'}`}>
                          {p.ativo === 'S' ? 'Ativo' : 'Inativo'}
                        </span>
                        <Botao
                          variant={expandido === p.codProd ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => toggleExpandir(p.codProd)}
                        >
                          Estoque
                        </Botao>
                      </div>
                    </div>

                    {expandido === p.codProd && (
                      <div className="estoque-painel">
                        {loadingEstoque.has(p.codProd) && (
                          <p className="estoque-status">Carregando estoque...</p>
                        )}
                        {!loadingEstoque.has(p.codProd) && estoqueMap[p.codProd]?.length === 0 && (
                          <p className="estoque-status">Sem saldo em estoque.</p>
                        )}
                        {!loadingEstoque.has(p.codProd) && (estoqueMap[p.codProd]?.length ?? 0) > 0 && (
                          <EstoqueTable itens={estoqueMap[p.codProd]} />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
