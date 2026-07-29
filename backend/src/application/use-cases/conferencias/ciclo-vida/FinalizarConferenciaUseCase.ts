import { IGatewayPort } from '../../../../domain/ports/IGatewayPort.js';
import { CONFERENCIA_CLIENT_EVENTS } from '../shared/clientEvents.js';

export interface FinalizarConferenciaInput {
  nuConf: string;
  peso?: number;
  qtdVol?: number;
}

export interface FinalizarConferenciaOutput {
  resultado: any;
}

/**
 * Use Case: Finalizar conferência
 */
export class FinalizarConferenciaUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: FinalizarConferenciaInput, correlationId?: string): Promise<FinalizarConferenciaOutput> {
    const response = await this.gateway.serviceCall<any>(
      'ConferenciaSP.finalizarConferencia',
      {
        serviceName: 'ConferenciaSP.finalizarConferencia',
        requestBody: {
          params: {
            nuConf: input.nuConf,
            peso: input.peso || 0,
            qtdVol: input.qtdVol || 0,
          },
          ...CONFERENCIA_CLIENT_EVENTS,
        },
      },
      correlationId,
      'mgecom',
    );

    return { resultado: response.responseBody };
  }
}
