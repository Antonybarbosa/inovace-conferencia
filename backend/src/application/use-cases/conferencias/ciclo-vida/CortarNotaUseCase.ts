import { IGatewayPort } from '../../../../domain/ports/IGatewayPort.js';
import { CONFERENCIA_CLIENT_EVENTS } from '../shared/clientEvents.js';

export interface CortarNotaInput {
  nuNota: number;
  peso?: number;
  qtdVol?: number;
}

export interface CortarNotaOutput {
  resultado: any;
}

/**
 * Use Case: Cortar nota por divergência na conferência
 */
export class CortarNotaUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: CortarNotaInput, correlationId?: string): Promise<CortarNotaOutput> {
    const response = await this.gateway.serviceCall<any>(
      'ConferenciaSP.cortar',
      {
        serviceName: 'ConferenciaSP.cortar',
        requestBody: {
          params: {
            nuNota: input.nuNota,
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
