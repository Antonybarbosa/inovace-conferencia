import { useEffect, useRef, useState } from 'react';

interface QuantidadeControlProps {
  /** Valor atual (absoluto) vindo do backend. */
  valor: number;
  /** Chamado com a NOVA quantidade total quando o usuário confirma (+/− ou Enter/blur). */
  onChange: (novaQtd: number) => Promise<void> | void;
  /** Quando true, desabilita todos os controles (ex.: item sem código de barras). */
  disabled?: boolean;
  /** Incremento padrão dos botões +/−. */
  step?: number;
  /** Quantidade mínima permitida (default 0). */
  min?: number;
}

/**
 * Controle compacto de quantidade: [−] [input] [+].
 *
 * O input é editável e sincroniza com `valor` (props) sempre que o backend
 * atualiza o item. A confirmação acontece em três casos:
 *   1. clique no botão +/− (envia o valor calculado imediatamente);
 *   2. Enter no input;
 *   3. blur do input (perde o foco).
 *
 * O `onChange` sempre recebe a quantidade ABSOLUTA — quem chama é responsável
 * por repassá-la ao backend.
 */
export function QuantidadeControl({
  valor,
  onChange,
  disabled = false,
  step = 1,
  min = 0,
}: QuantidadeControlProps) {
  const [valorLocal, setValorLocal] = useState(String(valor));
  const [salvando, setSalvando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincroniza quando o valor externo muda (ex.: após atualização do backend)
  useEffect(() => {
    setValorLocal(String(valor));
  }, [valor]);

  async function confirmar(novaQtd: number) {
    const qtd = Number.isFinite(novaQtd) ? novaQtd : 0;
    const qtdFinal = Math.max(qtd, min);
    // Nada a fazer se não mudou
    if (qtdFinal === valor) {
      setValorLocal(String(valor));
      return;
    }
    setSalvando(true);
    try {
      await onChange(qtdFinal);
    } finally {
      setSalvando(false);
    }
  }

  async function handleMenos() {
    if (disabled || salvando) return;
    const atual = parseFloat(valorLocal) || 0;
    await confirmar(atual - step);
  }

  async function handleMais() {
    if (disabled || salvando) return;
    const atual = parseFloat(valorLocal) || 0;
    await confirmar(atual + step);
  }

  function handleBlur() {
    const atual = parseFloat(valorLocal);
    if (!Number.isFinite(atual) || atual === valor) {
      setValorLocal(String(valor));
      return;
    }
    void confirmar(atual);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    }
  }

  const bloqueado = disabled || salvando;

  return (
    <div className={`qtd-control${bloqueado ? ' qtd-control--disabled' : ''}`}>
      <button
        type="button"
        className="qtd-btn"
        onClick={handleMenos}
        disabled={bloqueado}
        aria-label="Diminuir quantidade"
        tabIndex={-1}
      >
        −
      </button>
      <input
        ref={inputRef}
        type="number"
        className="qtd-input"
        value={valorLocal}
        min={min}
        step={step}
        disabled={bloqueado}
        onChange={(e) => setValorLocal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKey}
      />
      <button
        type="button"
        className="qtd-btn"
        onClick={handleMais}
        disabled={bloqueado}
        aria-label="Aumentar quantidade"
        tabIndex={-1}
      >
        +
      </button>
    </div>
  );
}
