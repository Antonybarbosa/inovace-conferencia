import { IGatewayPort } from '../../../../domain/ports/IGatewayPort.js';
import { CONFERENCIA_CLIENT_EVENTS } from '../shared/clientEvents.js';

export interface ExcluirConferenciaInput {
  nuNota: number;
}

export interface ExcluirConferenciaOutput {
  qtdConferenciasExcluidas: number;
}

/**
 * Use Case: Excluir/cancelar conferência aberta de uma nota
 */
export class ExcluirConferenciaUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: ExcluirConferenciaInput, correlationId?: string): Promise<ExcluirConferenciaOutput> {
    const response = await this.gateway.serviceCall<any>(
      'ConferenciaSP.excluirConferencia',
      {
        serviceName: 'ConferenciaSP.excluirConferencia',
        requestBody: {
          notas: {
            nota: [{ $: input.nuNota }],
          },
          ...CONFERENCIA_CLIENT_EVENTS,
        },
      },
      correlationId,
      'mgecom',
    );

    return {
      qtdConferenciasExcluidas: parseInt(response.responseBody?.qtdConferenciasExcluidas || '0', 10),
    };
  }
}
