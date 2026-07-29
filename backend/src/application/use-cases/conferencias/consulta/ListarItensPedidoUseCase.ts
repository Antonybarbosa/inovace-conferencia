import { IGatewayPort } from '../../../../domain/ports/IGatewayPort.js';
import { CONFERENCIA_CLIENT_EVENTS } from '../shared/clientEvents.js';

export interface ItemPedido {
  codProd: string;
  descrProd: string | null;
  codBarra: string | null;
  referencia: string | null;
  qtdPed: string;
  qtdConf: string;
  controle: string | null;
}

export interface ListarItensPedidoInput {
  nuNota: number;
}

export interface ListarItensPedidoOutput {
  conferenciaIniciada: boolean;
  itens: ItemPedido[];
  paginacao: boolean;
}

/**
 * Use Case: Listar itens do pedido com quantidades pedidas e conferidas
 * Enriquece com descrição e código de barras via DbExplorerSP
 */
export class ListarItensPedidoUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: ListarItensPedidoInput, correlationId?: string): Promise<ListarItensPedidoOutput> {
    // 1. Buscar itens via ConferenciaSP
    const response = await this.gateway.serviceCall<any>(
      'ConferenciaSP.listarItensPedido',
      {
        serviceName: 'ConferenciaSP.listarItensPedido',
        requestBody: {
          params: { nuNota: input.nuNota },
          ...CONFERENCIA_CLIENT_EVENTS,
        },
      },
      correlationId,
      'mgecom',
    );

    const body = response.responseBody;
    const produtos = body?.DIVERGENCIAS?.PRODUTO || [];
    const conferenciaIniciada = body?.DIVERGENCIAS?.CONFERENCIA_INICIADA === 'true';

    const itensRaw = (Array.isArray(produtos) ? produtos : [produtos]).map((p: any) => ({
      codProd: p.CODPROD?.$ || '',
      qtdPed: p.QTDPED?.$ || '0',
      qtdConf: p.QTDCONF?.$ || '0',
      controle: p.CONTROLE?.$ || null,
    }));

    if (itensRaw.length === 0) {
      return { conferenciaIniciada, itens: [], paginacao: body?.paginacao === 'true' };
    }

    // 2. Enriquecer com descrição e código de barras
    const codProds = itensRaw.map((i) => i.codProd).filter(Boolean);
    const produtoInfo = await this.buscarInfoProdutos(codProds, correlationId);

    const itens: ItemPedido[] = itensRaw.map((item) => ({
      ...item,
      descrProd: produtoInfo.get(item.codProd)?.descrProd || null,
      codBarra: produtoInfo.get(item.codProd)?.codBarra || null,
      referencia: produtoInfo.get(item.codProd)?.referencia || null,
    }));

    return {
      conferenciaIniciada,
      itens,
      paginacao: body?.paginacao === 'true',
    };
  }

  /**
   * Busca descrição, referência e código de barras dos produtos via SQL
   */
  private async buscarInfoProdutos(
    codProds: string[],
    correlationId?: string,
  ): Promise<Map<string, { descrProd: string; codBarra: string | null; referencia: string | null }>> {
    const map = new Map<string, { descrProd: string; codBarra: string | null; referencia: string | null }>();

    if (codProds.length === 0) return map;

    const inList = codProds.join(',');

    const sql = `
      SELECT P.CODPROD, P.DESCRPROD, P.REFERENCIA, B.CODBARRA
      FROM TGFPRO P
      LEFT JOIN (
        SELECT CODPROD, MIN(CODBARRA) AS CODBARRA
        FROM TGFBAR
        GROUP BY CODPROD
      ) B ON B.CODPROD = P.CODPROD
      WHERE P.CODPROD IN (${inList})
    `;

    try {
      const response = await this.gateway.serviceCall<any>(
        'DbExplorerSP.executeQuery',
        {
          serviceName: 'DbExplorerSP.executeQuery',
          requestBody: { sql },
        },
        correlationId,
      );

      const rows: any[] = response.responseBody?.rows || [];

      for (const row of rows) {
        const codProd = String(row[0]);
        if (!map.has(codProd)) {
          map.set(codProd, {
            descrProd: row[1] || '',
            referencia: row[2] || null,
            codBarra: row[3] || null,
          });
        }
      }
    } catch (error) {
      // Se falhar a busca complementar, retorna sem enriquecimento
      console.warn('[ListarItensPedido] Falha ao enriquecer produtos:', (error as Error).message);
    }

    return map;
  }
}
