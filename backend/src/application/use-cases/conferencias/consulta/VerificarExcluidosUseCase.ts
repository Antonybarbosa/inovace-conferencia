import { IGatewayPort } from '../../../../domain/ports/IGatewayPort.js';

export interface VerificarExcluidosInput {
  nuNota: number;
}

export interface VerificarExcluidosOutput {
  possuiApenasProdutosExcluidos: boolean;
}

/**
 * Use Case: Verificar se nota possui apenas produtos excluídos
 * Guard check antes de iniciar conferência
 */
export class VerificarExcluidosUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: VerificarExcluidosInput, correlationId?: string): Promise<VerificarExcluidosOutput> {
    const response = await this.gateway.serviceCall<any>(
      'ConferenciaSP.getApenasExcluidosConferencia',
      {
        serviceName: 'ConferenciaSP.getApenasExcluidosConferencia',
        requestBody: {
          params: { nuNota: input.nuNota },
        },
      },
      correlationId,
      'mgecom',
    );

    return {
      possuiApenasProdutosExcluidos: response.responseBody?.possuiApenasProdutosExcluidos === 'true',
    };
  }
}
