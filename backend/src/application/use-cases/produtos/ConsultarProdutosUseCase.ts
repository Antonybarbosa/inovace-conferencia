import { IGatewayPort } from '../../../domain/ports/IGatewayPort.js';

export interface ProdutoRecord {
  codProd: string;
  descrProd: string;
  codVol: string;
  referencia: string | null;
  codBarra: string | null;
  marca: string | null;
  ativo: string;
}

export interface ConsultarProdutosInput {
  termo: string;
  limite?: number;
}

export interface ConsultarProdutosOutput {
  records: ProdutoRecord[];
  total: number;
}

/**
 * Use Case: Consultar produtos por termo (código ou descrição)
 *
 * Busca na TGFPRO via DbExplorerSP.executeQuery, comparando o termo contra
 * CODPROD e DESCRPROD com LIKE. Retorna no máximo `limite` registros (50
 * por padrão) para evitar payloads gigantescos em buscas muito abertas.
 */
export class ConsultarProdutosUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: ConsultarProdutosInput, correlationId?: string): Promise<ConsultarProdutosOutput> {
    const limite = Math.min(input.limite ?? 50, 200);
    const termo = this.sanitizar(input.termo);

    const sql = `
SELECT
    PRO.CODPROD,
    PRO.DESCRPROD,
    PRO.CODVOL,
    PRO.REFERENCIA,
    PRO.ATIVO
FROM TGFPRO PRO
WHERE (UPPER(PRO.DESCRPROD) LIKE UPPER('%${termo}%')
    OR UPPER(PRO.CODPROD) LIKE UPPER('%${termo}%')
    OR UPPER(PRO.REFERENCIA) LIKE UPPER('%${termo}%'))
    --AND ROWNUM <= ${limite}
    AND ATIVO = 'S'
ORDER BY PRO.CODPROD,PRO.DESCRPROD
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

    const records: ProdutoRecord[] = rows.map((row) => {
      const obj: Record<string, any> = {};
      metadata.forEach((field, index) => {
        obj[field.name] = row[index];
      });

      return {
        codProd: String(obj.CODPROD),
        descrProd: obj.DESCRPROD || '',
        codVol: obj.CODVOL || '',
        referencia: obj.REFERENCIA || null,
        codBarra: null,
        marca: null,
        ativo: obj.ATIVO || 'S',
      };
    });

    return {
      records,
      total: records.length,
    };
  }

  /**
   * Escapa aspas simples para evitar injeção SQL no DbExplorerSP,
   * que interpola o SQL como string pura.
   */
  private sanitizar(termo: string): string {
    return termo.trim().replace(/'/g, "''");
  }
}
