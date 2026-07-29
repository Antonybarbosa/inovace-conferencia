import { IGatewayPort } from '../../../../domain/ports/IGatewayPort.js';
import { CONFERENCIA_CLIENT_EVENTS } from '../shared/clientEvents.js';

export interface GetProdutoInput {
  nuNota: number;
  codBarra: string;
  controle?: string;
}

export interface GetProdutoOutput {
  produto: any;
}

/**
 * Use Case: Buscar produto na nota por código de barras
 */
export class GetProdutoUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: GetProdutoInput, correlationId?: string): Promise<GetProdutoOutput> {
    const response = await this.gateway.serviceCall<any>(
      'ConferenciaSP.getProduto',
      {
        serviceName: 'ConferenciaSP.getProduto',
        requestBody: {
          params: {
            nuNota: input.nuNota,
            codBarra: input.codBarra,
            controle: input.controle || ' ',
          },
          ...CONFERENCIA_CLIENT_EVENTS,
        },
      },
      correlationId,
      'mgecom',
    );

    return { produto: response.responseBody };
  }
}
