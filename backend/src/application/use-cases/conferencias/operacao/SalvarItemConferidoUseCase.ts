import { IGatewayPort } from '../../../../domain/ports/IGatewayPort.js';
import { CONFERENCIA_CLIENT_EVENTS } from '../shared/clientEvents.js';

export interface SalvarItemConferidoInput {
  numConf: string;
  nuNota: number;
  codBarra: string;
  controle?: string;
  qtdConf: string;
  substituirProduto?: boolean;
  volume?: string;
  exigeIdentificadores?: string;
  codUMA?: string;
}

export interface SalvarItemConferidoOutput {
  resultado: any;
}

/**
 * Use Case: Conferir um item (registrar quantidade conferida)
 */
export class SalvarItemConferidoUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: SalvarItemConferidoInput, correlationId?: string): Promise<SalvarItemConferidoOutput> {
    const response = await this.gateway.serviceCall<any>(
      'ConferenciaSP.salvarItemConferido',
      {
        serviceName: 'ConferenciaSP.salvarItemConferido',
        requestBody: {
          params: {
            numConf: input.numConf,
            nuNota: input.nuNota,
            codBarra: input.codBarra,
            controle: input.controle || '',
            qtdConf: input.qtdConf,
            substituirProduto: input.substituirProduto || false,
            volume: input.volume || '',
            exigeIdentificadores: input.exigeIdentificadores || 'N',
            codUMA: input.codUMA || '',
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
