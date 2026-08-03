/**
 * Controle de permissões por usuário (regra do servidor).
 *
 * Espelha `frontend/src/domain/permissions.ts`, mas é esta que vale: o
 * frontend apenas esconde colunas, enquanto aqui os campos deixam de ser
 * enviados. Sem isso, os valores continuariam visíveis no DevTools e um
 * bundle antigo em cache voltaria a exibi-los.
 *
 * Mantenha as duas listas iguais.
 */

/**
 * Logins com visão completa (supervisores/admin).
 * Comparação EXATA, ignorando caixa e espaços — sem regra de prefixo.
 */
const USUARIOS_PRIVILEGIADOS = [
  'SUP',
  'ANTONY',
  'ANTONY.B',
];

function normalizar(nome: string): string {
  return nome.trim().toUpperCase();
}

const PRIVILEGIADOS = new Set(USUARIOS_PRIVILEGIADOS.map(normalizar));

/**
 * Indica se o usuário pode receber os campos sensíveis da conferência
 * (código de barras, referência e quantidade pedida).
 *
 * Padrão seguro: sem usuário identificado, nega.
 */
export function podeVerCamposSensiveis(nomeUsu?: string | null): boolean {
  if (!nomeUsu) return false;
  return PRIVILEGIADOS.has(normalizar(nomeUsu));
}
