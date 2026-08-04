/**
 * Produto consultado na tabela TGFPRO.
 */
export interface Produto {
  codProd: string;
  descrProd: string;
  codVol: string;
  referencia: string | null;
  codBarra: string | null;
  marca: string | null;
  ativo: string;
}

/**
 * Saldo de estoque por empresa/local/lote (tabela TGFEST).
 * As datas vêm no formato do Sankhya (DDMMYYYY HH:MM:SS).
 */
export interface EstoqueItem {
  codEmp: number;
  codLocal: number;
  local: string;
  lote: string | null;
  estoque: number;
  dtFabricacao: string | null;
  dtValidade: string | null;
}
