/**
 * Controle de permissões por usuário
 *
 * Usuários privilegiados veem todos os campos (código de barras, qtd pedida).
 * Demais usuários fazem conferência cega (campos ocultos).
 */

/** Usuários com visão completa (supervisores/admin) */
const USUARIOS_PRIVILEGIADOS = ['SUP', 'ANTONY'];

/**
 * Verifica se o usuário pode ver campos sensíveis na conferência
 * (código de barras e quantidade pedida)
 */
export function podeVerCamposSensiveis(nomeUsu?: string | null): boolean {
  if (!nomeUsu) return false;
  const nome = nomeUsu.toUpperCase().trim();
  return USUARIOS_PRIVILEGIADOS.some((u) => nome === u || nome.startsWith(`${u}.`));
}
