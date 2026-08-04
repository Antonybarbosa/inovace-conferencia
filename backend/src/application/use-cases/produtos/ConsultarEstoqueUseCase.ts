import { IGatewayPort } from '../../../domain/ports/IGatewayPort.js';

export interface EstoqueItem {
  codEmp: number;
  codLocal: number;
  local: string;
  lote: string | null;
  estoque: number;
  dtFabricacao: string | null;
  dtValidade: string | null;
}

export interface ConsultarEstoqueInput {
  codProd: string;
}

export interface ConsultarEstoqueOutput {
  codProd: string;
  records: EstoqueItem[];
  total: number;
}

/**
 * Use Case: Consultar saldo de estoque de um produto
 *
 * Tudo está em TGFEST: CODEMP, CODLOCAL, CONTROLE (lote), ESTOQUE,
 * DTFABRICACAO e DTVALIDADE. O nome do local vem de TGFLOC via JOIN.
 *
 * Retorna apenas linhas com saldo != 0, ordenadas por empresa e local.
 */
export class ConsultarEstoqueUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: ConsultarEstoqueInput, correlationId?: string): Promise<ConsultarEstoqueOutput> {
    const codProd = input.codProd.replace(/'/g, "''");

    const sql = `
SELECT
    EST.CODEMP,
    EST.CODLOCAL,
    LOC.DESCRLOCAL AS LOCAL,
    EST.CONTROLE,
    EST.ESTOQUE,
    EST.DTFABRICACAO,
    EST.DTVAL
FROM TGFEST EST
LEFT JOIN TGFLOC LOC ON LOC.CODLOCAL = EST.CODLOCAL
WHERE EST.CODPROD = ${codProd}
    AND EST.ESTOQUE <> 0
ORDER BY EST.CODEMP, EST.CODLOCAL, EST.CONTROLE
    `.trim();

    const response = await this.gateway.serviceCall<any>(
      'DbExplorerSP.executeQuery',
      {
        serviceName: 'DbExplorerSP.executeQuery',
        requestBody: { sql },
      },
      correlationId,
    );

    const body = response.responseBody;
    const rows: any[] = body?.rows || [];
    const metadata: { name: string }[] = body?.fieldsMetadata || [];

    const records: EstoqueItem[] = rows.map((row) => {
      const obj: Record<string, any> = {};
      metadata.forEach((field, index) => {
        obj[field.name] = row[index];
      });

      return {
        codEmp: obj.CODEMP,
        codLocal: obj.CODLOCAL,
        local: obj.LOCAL || '',
        lote: obj.CONTROLE ? String(obj.CONTROLE).trim() : null,
        estoque: Number(obj.ESTOQUE) || 0,
        dtFabricacao: obj.DTFABRICACAO || null,
        dtValidade: obj.DTVAL || null,
      };
    });

    return {
      codProd: input.codProd,
      records,
      total: records.length,
    };
  }
}
