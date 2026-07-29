import { IGatewayPort } from '../../../../domain/ports/IGatewayPort.js';
import { CONFERENCIA_CLIENT_EVENTS } from '../shared/clientEvents.js';

export interface GetProdutosDivergentesInput {
  nuNota: number;
}

export interface GetProdutosDivergentesOutput {
  divergentes: any;
}

/**
 * Use Case: Listar produtos com divergência entre pedido e conferido
 */
export class GetProdutosDivergentesUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: GetProdutosDivergentesInput, correlationId?: string): Promise<GetProdutosDivergentesOutput> {
    const response = await this.gateway.serviceCall<any>(
      'ConferenciaSP.getProdutosDivergentes',
      {
        serviceName: 'ConferenciaSP.getProdutosDivergentes',
        requestBody: {
          params: { nuNota: input.nuNota },
          ...CONFERENCIA_CLIENT_EVENTS,
        },
      },
      correlationId,
      'mgecom',
    );

    return { divergentes: response.responseBody };
  }
}
