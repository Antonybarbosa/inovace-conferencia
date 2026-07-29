import { IGatewayPort } from '../../../../domain/ports/IGatewayPort.js';
import { CONFERENCIA_CLIENT_EVENTS } from '../shared/clientEvents.js';

export interface SalvarVolumeInput {
  numConf: string;
  nuNota: number;
  volume: number;
}

export interface SalvarVolumeOutput {
  resultado: any;
}

/**
 * Use Case: Registrar volume na conferência
 */
export class SalvarVolumeUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: SalvarVolumeInput, correlationId?: string): Promise<SalvarVolumeOutput> {
    const response = await this.gateway.serviceCall<any>(
      'ConferenciaSP.salvarVolumeSimplificado',
      {
        serviceName: 'ConferenciaSP.salvarVolumeSimplificado',
        requestBody: {
          params: {
            numConf: input.numConf,
            nuNota: input.nuNota,
            volume: input.volume,
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
