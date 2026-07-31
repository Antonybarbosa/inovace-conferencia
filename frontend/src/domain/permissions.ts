/**
 * Controle de permissões por usuário.
 *
 * Usuários privilegiados veem todos os campos (código de barras, referência e
 * quantidade pedida). Os demais fazem conferência cega, com esses campos
 * ocultos na tela de conferência.
 */

/**
 * Logins com visão completa (supervisores/admin).
 *
 * A comparação é EXATA, ignorando maiúsculas e espaços. Não há regra de
 * prefixo: uma versão anterior aceitava qualquer login começando com `SUP.`
 * ou `ANTONY.`, o que liberava usuários comuns cujo login seguia o padrão
 * `SUP.NOME` por acidente.
 *
 * Se um supervisor entra com login diferente (ex.: `ANTONY.B`), acrescente o
 * login completo nesta lista.
 */
const USUARIOS_PRIVILEGIADOS = [
  'SUP',
  'ANTONY',
  'ANTONY.B',
];

/** Normaliza o login para comparação: sem espaços nas pontas, em maiúsculas */
function normalizar(nome: string): string {
  return nome.trim().toUpperCase();
}

const PRIVILEGIADOS = new Set(USUARIOS_PRIVILEGIADOS.map(normalizar));

/**
 * Indica se o usuário pode ver os campos sensíveis da conferência
 * (código de barras, referência e quantidade pedida).
 *
 * Padrão seguro: sem usuário identificado, oculta.
 */
export function podeVerCamposSensiveis(nomeUsu?: string | null): boolean {
  if (!nomeUsu) return false;
  return PRIVILEGIADOS.has(normalizar(nomeUsu));
}
