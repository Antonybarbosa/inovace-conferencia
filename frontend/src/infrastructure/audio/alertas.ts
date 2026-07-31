/**
 * Alertas sonoros e táteis da conferência.
 *
 * O som é sintetizado em tempo de execução pela Web Audio API em vez de vir
 * de um arquivo .mp3/.wav. Isso evita peso no bundle, dispensa request de
 * rede (o coletor pode estar em rede instável) e funciona offline.
 *
 * Todas as funções falham em silêncio se a API não existir no dispositivo.
 */

let contexto: AudioContext | null = null;

type JanelaComWebkit = Window & { webkitAudioContext?: typeof AudioContext };

function obterContexto(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const Ctor = window.AudioContext ?? (window as JanelaComWebkit).webkitAudioContext;
  if (!Ctor) return null;

  if (!contexto) {
    try {
      contexto = new Ctor();
    } catch {
      return null;
    }
  }

  // Navegadores criam o contexto suspenso até o primeiro gesto do usuário.
  // Como o alerta sempre nasce de um Enter/clique, o resume é permitido aqui.
  if (contexto.state === 'suspended') {
    void contexto.resume();
  }

  return contexto;
}

/** Agenda um bipe único no contexto de áudio */
function bipe(
  ctx: AudioContext,
  frequencia: number,
  inicio: number,
  duracao: number,
  volume: number,
): void {
  const oscilador = ctx.createOscillator();
  const ganho = ctx.createGain();

  oscilador.type = 'square';
  oscilador.frequency.value = frequencia;

  // Rampas curtas de entrada/saída evitam o "clique" audível nas bordas
  ganho.gain.setValueAtTime(0, inicio);
  ganho.gain.linearRampToValueAtTime(volume, inicio + 0.01);
  ganho.gain.setValueAtTime(volume, inicio + duracao - 0.02);
  ganho.gain.linearRampToValueAtTime(0, inicio + duracao);

  oscilador.connect(ganho).connect(ctx.destination);
  oscilador.start(inicio);
  oscilador.stop(inicio + duracao);
}

/** Vibração de erro (ignorada em desktop e no iOS Safari) */
export function vibrarErro(): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate([120, 80, 220]);
  }
}

/**
 * Alerta de erro: dois bipes descendentes.
 * Usado quando o Sankhya recusa a conferência do item
 * (quantidade acima do negociado, produto fora do pedido, etc.)
 */
export function tocarAlertaErro(): void {
  const ctx = obterContexto();
  if (!ctx) return;

  const agora = ctx.currentTime;
  bipe(ctx, 660, agora, 0.16, 0.18);
  bipe(ctx, 440, agora + 0.2, 0.28, 0.18);

  vibrarErro();
}
