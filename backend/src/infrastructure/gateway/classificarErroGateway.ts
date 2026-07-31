import {
  AppError,
  GatewayNaoAutorizadoError,
  SankhyaErroError,
  SankhyaIndisponivelError,
} from '../../domain/errors/AppError.js';

/** Códigos do Node/axios que indicam falha de rede, não resposta de erro */
const CODIGOS_DE_REDE = new Set([
  'ECONNREFUSED', // porta fechada
  'ENOTFOUND', // DNS não resolveu
  'EAI_AGAIN', // falha temporária de DNS
  'ECONNRESET', // conexão derrubada no meio
  'ETIMEDOUT', // timeout de conexão
  'ECONNABORTED', // timeout do axios
  'EHOSTUNREACH',
  'ENETUNREACH',
  'EPIPE',
  'ERR_NETWORK',
  'ERR_CANCELED',
]);

/**
 * Traduz o erro cru de uma chamada ao Gateway Sankhya para a taxonomia da
 * aplicação, para o controller poder responder com o status HTTP correto.
 *
 * Distingue três situações que antes eram indistinguíveis:
 *  - não chegamos ao Sankhya          → SankhyaIndisponivelError (503)
 *  - chegamos, e ele recusou a app    → GatewayNaoAutorizadoError (502)
 *  - chegamos, e ele devolveu erro    → SankhyaErroError (502)
 */
export function classificarErroGateway(erro: unknown): AppError {
  // Já classificado em camada anterior — preserva
  if (erro instanceof AppError) return erro;

  const e = erro as {
    code?: string;
    message?: string;
    response?: { status?: number; data?: unknown };
    config?: { url?: string };
  };

  // 1. Falha de rede: não houve resposta
  if (e?.code && CODIGOS_DE_REDE.has(e.code)) {
    return new SankhyaIndisponivelError(
      `Não foi possível conectar ao Sankhya (${e.code})`,
    );
  }

  // Axios sem `response` também significa que nada voltou
  if (e && 'config' in e && !e.response && e.code) {
    return new SankhyaIndisponivelError(
      `Não foi possível conectar ao Sankhya (${e.code})`,
    );
  }

  const status = e?.response?.status;

  // 2. O Gateway recusou as credenciais da aplicação.
  //    Vem do /authenticate ou de uma chamada que nem o retry salvou.
  if (status === 401 || status === 403) {
    return new GatewayNaoAutorizadoError();
  }

  // 3. Gateway/ERP com problema interno ou indisponível
  if (status === 502 || status === 503 || status === 504) {
    return new SankhyaIndisponivelError(
      `Sankhya indisponível (HTTP ${status})`,
    );
  }

  if (status && status >= 500) {
    return new SankhyaErroError(`Erro interno no Sankhya (HTTP ${status})`);
  }

  // 4. Erro de negócio já formatado pelo adapter: "[Sankhya Serviço] mensagem"
  if (typeof e?.message === 'string' && e.message.startsWith('[Sankhya ')) {
    return new SankhyaErroError(e.message);
  }

  return new SankhyaErroError(e?.message || 'Erro inesperado ao chamar o Sankhya');
}
