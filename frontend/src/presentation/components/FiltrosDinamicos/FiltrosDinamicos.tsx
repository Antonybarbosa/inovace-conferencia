import { useState, useMemo, useCallback } from 'react';
import { Botao } from '../Botao/Botao';
import { Campo } from '../Campo/Campo';
import './FiltrosDinamicos.css';

/** Configuração de um campo filtrável */
interface CampoFiltro {
  key: string;
  label: string;
  tipo: 'texto' | 'numero' | 'status';
  opcoes?: string[];
}

interface FiltrosDinamicosProps<T extends object> {
  dados: T[];
  onFiltrar: (filtrados: T[]) => void;
  /** Campos que devem ser exibidos como filtros. Se não informado, gera automaticamente. */
  camposVisiveis?: CampoFiltro[];
  /**
   * Classe extra no container. Use `filtros-container--inline` para encaixar o
   * botão de filtros numa barra já existente, junto de outros controles.
   */
  className?: string;
}

/** Labels amigáveis para campos conhecidos */
const LABELS_CONHECIDOS: Record<string, string> = {
  nunota: 'NUNOTA',
  numNota: 'Nº Nota',
  parceiro: 'Parceiro',
  rotaEntrega: 'Rota',
  transportadora: 'Transportadora',
  statusConferencia: 'Status',
  ordemCarga: 'Ordem Carga',
  usuarioConferente: 'Conferente',
  obsPedido: 'Observação',
  codEmp: 'Empresa',
  dtFaturamento: 'Dt. Faturamento',
  qtdProdutosDistintos: 'Qtd Produtos',
};

/** Campos que não fazem sentido como filtro */
const CAMPOS_OCULTOS = ['nroUnico', 'nuConf', 'dtInicioConferencia', 'qtdVolumes'];

function detectarTipo(key: string, valores: unknown[]): 'texto' | 'numero' | 'status' {
  const amostra = valores.filter(v => v !== null && v !== undefined && v !== '');
  if (amostra.length === 0) return 'texto';

  // Campos com valores discretos (até 20 valores únicos) → select/dropdown
  const unicos = new Set(amostra.map(String));
  if (unicos.size <= 20 && unicos.size > 0) return 'status';

  // Numérico puro
  if (amostra.every(v => typeof v === 'number')) return 'numero';

  return 'texto';
}

export function FiltrosDinamicos<T extends object>({
  dados,
  onFiltrar,
  camposVisiveis,
  className = '',
}: FiltrosDinamicosProps<T>) {
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [aberto, setAberto] = useState(false);

  // Gerar campos automaticamente a partir dos dados
  const camposGerados: CampoFiltro[] = useMemo(() => {
    if (camposVisiveis) return camposVisiveis;
    if (dados.length === 0) return [];

    const keys = Object.keys(dados[0]).filter(k => !CAMPOS_OCULTOS.includes(k));

    return keys.map(key => {
      const valores = dados.map(d => (d as Record<string, unknown>)[key]);
      const tipo = detectarTipo(key, valores);
      const opcoes = tipo === 'status'
        ? [...new Set(valores.filter(v => v !== null).map(String))]
        : undefined;

      return {
        key,
        label: LABELS_CONHECIDOS[key] || key,
        tipo,
        opcoes,
      };
    });
  }, [dados, camposVisiveis]);

  // Aplicar filtros
  const aplicarFiltros = useCallback((novosFiltros: Record<string, string>) => {
    const filtrados = dados.filter(item => {
      return Object.entries(novosFiltros).every(([key, valor]) => {
        if (!valor || valor === '') return true;
        const campo = (item as Record<string, unknown>)[key];
        if (campo === null || campo === undefined) return false;
        return String(campo).toLowerCase().includes(valor.toLowerCase());
      });
    });
    onFiltrar(filtrados);
  }, [dados, onFiltrar]);

  function handleChange(key: string, valor: string) {
    const novosFiltros = { ...filtros, [key]: valor };
    setFiltros(novosFiltros);
    aplicarFiltros(novosFiltros);
  }

  function handleLimpar() {
    setFiltros({});
    onFiltrar(dados);
  }

  const temFiltroAtivo = Object.values(filtros).some(v => v !== '');

  return (
    <div className={`filtros-container ${className}`}>
      <div className="filtros-header">
        <Botao
          variant={temFiltroAtivo ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setAberto(!aberto)}
        >
          {aberto ? '✕ Fechar' : '⚙ Filtros'}
          {temFiltroAtivo && <span className="filtro-badge">{Object.values(filtros).filter(v => v !== '').length}</span>}
        </Botao>
        {temFiltroAtivo && (
          <Botao variant="ghost" size="sm" onClick={handleLimpar}>
            Limpar filtros
          </Botao>
        )}
        {temFiltroAtivo && !aberto && (
          <div className="filtros-ativos-tags">
            {Object.entries(filtros)
              .filter(([, valor]) => valor !== '')
              .map(([key, valor]) => {
                const campo = camposGerados.find(c => c.key === key);
                return (
                  <span key={key} className="filtro-tag">
                    <strong>{campo?.label || key}:</strong> {valor}
                    <button
                      className="filtro-tag-remove"
                      onClick={() => handleChange(key, '')}
                      aria-label={`Remover filtro ${campo?.label || key}`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
          </div>
        )}
      </div>

      {aberto && (
        <div className={`filtros-grid ${temFiltroAtivo ? 'filtros-grid--ativo' : ''}`}>
          {camposGerados.map(campo => (
            <div key={campo.key} className="filtro-item">
              {campo.tipo === 'status' && campo.opcoes ? (
                <div className="filtro-select-wrapper">
                  <label className="filtro-label">{campo.label}</label>
                  <select
                    value={filtros[campo.key] || ''}
                    onChange={(e) => handleChange(campo.key, e.target.value)}
                    className="filtro-select"
                  >
                    <option value="">Todos</option>
                    {campo.opcoes.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <Campo
                  label={campo.label}
                  value={filtros[campo.key] || ''}
                  onChange={(e) => handleChange(campo.key, e.target.value)}
                  placeholder={`Filtrar ${campo.label.toLowerCase()}...`}
                  type={campo.tipo === 'numero' ? 'number' : 'text'}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
