import { IGatewayPort } from '../../../../domain/ports/IGatewayPort.js';
import { CONFERENCIA_CLIENT_EVENTS } from '../shared/clientEvents.js';

export interface ListarItensConferidosInput {
  nuNota: number;
  nuConf: number;
}

export interface ListarItensConferidosOutput {
  itens: any[];
  paginacao: boolean;
}

/**
 * Use Case: Listar itens já conferidos na conferência atual
 */
export class ListarItensConferidosUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: ListarItensConferidosInput, correlationId?: string): Promise<ListarItensConferidosOutput> {
    const response = await this.gateway.serviceCall<any>(
      'ConferenciaSP.listarItensConferidos',
      {
        serviceName: 'ConferenciaSP.listarItensConferidos',
        requestBody: {
          params: {
            nuNota: input.nuNota,
            nuConf: input.nuConf,
          },
          ...CONFERENCIA_CLIENT_EVENTS,
        },
      },
      correlationId,
      'mgecom',
    );

    const body = response.responseBody;

    return {
      itens: body?.list || [],
      paginacao: body?.paginacao === true || body?.paginacao === 'true',
    };
  }
}
