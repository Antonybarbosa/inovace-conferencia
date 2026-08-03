import { IGatewayPort } from '../../../../domain/ports/IGatewayPort.js';
import { CONFERENCIA_CLIENT_EVENTS } from '../shared/clientEvents.js';
import { podeVerCamposSensiveis } from '../../../../domain/permissions.js';

export interface ItemPedido {
  codProd: string;
  sequencia: string;
  descrProd: string | null;
  codBarra: string | null;
  referencia: string | null;
  qtdPed: string;
  qtdConf: string;
  controle: string | null;
}

/**
 * Situação do item, calculada no servidor.
 *
 * Existe para o frontend separar listas, marcar "Parcial" e contar sem
 * precisar da quantidade pedida — que é justamente o dado escondido do
 * conferente na conferência cega.
 */
export type StatusItem = 'pendente' | 'parcial' | 'completo';

/**
 * Item como sai na resposta HTTP.
 * `qtdPed`, `codBarra` e `referencia` vêm `null` para usuários não
 * privilegiados: são omitidos na origem, não apenas escondidos na tela.
 */
export interface ItemPedidoResponse extends Omit<ItemPedido, 'qtdPed'> {
  qtdPed: string | null;
  status: StatusItem;
}

export interface ListarItensPedidoInput {
  nuNota: number;
  /**
   * Login do usuário que está pedindo a lista. Define se os campos sensíveis
   * (código de barras, referência, quantidade pedida) vão na resposta.
   * Ausente = tratado como não privilegiado.
   */
  usuario?: string;
}

export interface ListarItensPedidoOutput {
  conferenciaIniciada: boolean;
  itens: ItemPedidoResponse[];
  paginacao: boolean;
  /** Informa ao frontend se ele recebeu os campos sensíveis */
  camposSensiveis: boolean;
}

/**
 * Use Case: Listar itens do pedido com quantidades pedidas e conferidas
 * 
 * Estratégia: busca TODOS os itens da nota via SQL (nunca perde itens),
 * e cruza com as qtdConf do ConferenciaSP.listarItensPedido
 */
export class ListarItensPedidoUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: ListarItensPedidoInput, correlationId?: string): Promise<ListarItensPedidoOutput> {
    // 1. Buscar TODOS os itens da nota via SQL (fonte completa)
    const todosItens = await this.buscarTodosItensDaNota(input.nuNota, correlationId);

    // 2. Buscar qtdConf via ConferenciaSP (retorna apenas divergentes)
    let conferenciaIniciada = false;
    const qtdConfMap = new Map<string, string>();

    try {
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
      conferenciaIniciada = body?.DIVERGENCIAS?.CONFERENCIA_INICIADA === 'true';
      const produtos = body?.DIVERGENCIAS?.PRODUTO || [];
      const lista = Array.isArray(produtos) ? produtos : [produtos];

      for (const p of lista) {
        const codProd = p.CODPROD?.$ || '';
        const qtdConf = p.QTDCONF?.$ || '0';
        if (codProd) qtdConfMap.set(codProd, qtdConf);
      }
    } catch {
      // Se falhar, continuamos sem as qtdConf (todos ficam como 0)
    }

    // 3. Cruzar: distribuir qtdConf por sequência
    // O Sankhya agrupa por CODPROD, mas temos múltiplas sequências do mesmo produto
    const itens: ItemPedido[] = todosItens.map((item) => {
      const qtdConfFromSankhya = qtdConfMap.get(item.codProd);

      let qtdConf: string;
      if (qtdConfFromSankhya !== undefined) {
        // Item está na lista de divergências
        // Distribuir qtdConf entre as sequências do mesmo CODPROD proporcionalmente
        const mesmosProd = todosItens.filter(i => i.codProd === item.codProd);
        if (mesmosProd.length === 1) {
          qtdConf = qtdConfFromSankhya;
        } else {
          // Proporção baseada na qtdPed de cada sequência
          const totalPedMesmoProd = mesmosProd.reduce((s, i) => s + parseFloat(i.qtdPed), 0);
          const totalConf = parseFloat(qtdConfFromSankhya);
          const proporcao = totalPedMesmoProd > 0 ? parseFloat(item.qtdPed) / totalPedMesmoProd : 0;
          qtdConf = String(Math.min(parseFloat(item.qtdPed), Math.round(totalConf * proporcao)));
        }
      } else if (conferenciaIniciada) {
        // Conferência iniciada mas item não está na lista de divergências = totalmente conferido
        qtdConf = item.qtdPed;
      } else {
        qtdConf = '0';
      }

      return { ...item, qtdConf };
    });

    // 4. Calcular o status no servidor e, se o usuário não for privilegiado,
    //    remover os campos sensíveis da resposta.
    const verCamposSensiveis = podeVerCamposSensiveis(input.usuario);

    const itensResposta: ItemPedidoResponse[] = itens.map((item) => {
      const pedido = parseFloat(item.qtdPed);
      const conferido = parseFloat(item.qtdConf);

      let status: StatusItem;
      if (conferido >= pedido) status = 'completo';
      else if (conferido > 0) status = 'parcial';
      else status = 'pendente';

      if (verCamposSensiveis) {
        return { ...item, status };
      }

      return {
        ...item,
        status,
        qtdPed: null,
        codBarra: null,
        referencia: null,
      };
    });

    return {
      conferenciaIniciada,
      itens: itensResposta,
      paginacao: false,
      camposSensiveis: verCamposSensiveis,
    };
  }

  /**
   * Busca todos os itens da nota via SQL com descrição e código de barras
   */
  private async buscarTodosItensDaNota(
    nuNota: number,
    correlationId?: string,
  ): Promise<ItemPedido[]> {
    const sql = `
      SELECT ITE.CODPROD, ITE.SEQUENCIA, ITE.QTDNEG, ITE.CONTROLE,
             PRO.DESCRPROD, PRO.REFERENCIA, BAR.CODBARRA
      FROM TGFITE ITE
      INNER JOIN TGFPRO PRO ON PRO.CODPROD = ITE.CODPROD
      LEFT JOIN (
        SELECT CODPROD, MIN(CODBARRA) AS CODBARRA
        FROM TGFBAR
        GROUP BY CODPROD
      ) BAR ON BAR.CODPROD = ITE.CODPROD
      WHERE ITE.NUNOTA = ${nuNota}
      ORDER BY ITE.SEQUENCIA
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

      return rows.map((row) => ({
        codProd: String(row[0]),
        sequencia: String(row[1]),
        qtdPed: String(row[2] || '0'),
        controle: row[3] || null,
        descrProd: row[4] || null,
        referencia: row[5] || null,
        codBarra: row[6] || null,
        qtdConf: '0',
      }));
    } catch {
      return [];
    }
  }
}
