import { IGatewayPort } from '../../../../domain/ports/IGatewayPort.js';
import { CONFERENCIA_CLIENT_EVENTS } from '../shared/clientEvents.js';

export interface IniciarConferenciaInput {
  nuNota: number;
  codUsu?: number;
  nomeUsu?: string;
  mgeSession?: string;
  iniciarRecontagem?: boolean;
}

export interface IniciarConferenciaOutput {
  numConf: string;
  numNota: string;
  tipMov: string;
  isRecontagem: string;
  tipoContagem: string;
  vendedor: string;
  parceiro: string;
  configuracoes: {
    mostrarProdPed: string;
    autoFeedback: string;
    mostrarProdConf: string;
    mostrarQtdPed: string;
    mostrarQtdConf: string;
    mostrarProdDiver: string;
    mostrarAlertaSonoroDivergencia: string;
    formacaoVolumes: string;
    ignorarComponenteKit: string;
    fatAoConcluir: string;
    mostrarCodBarrasPed: string;
    registrarPeso: string;
    exigeIdentif: string;
    produtosForaPedido: string;
  };
}

/**
 * Use Case: Iniciar conferência de saída
 * Cria registro TGFCON2 e retorna configurações da tela
 */
export class IniciarConferenciaUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: IniciarConferenciaInput, correlationId?: string): Promise<IniciarConferenciaOutput> {
    // 1. Criar a conferência
    const response = await this.gateway.serviceCall<any>(
      'ConferenciaSP.salvarCabecalhoConferencia',
      {
        serviceName: 'ConferenciaSP.salvarCabecalhoConferencia',
        requestBody: {
          params: {
            nuNota: input.nuNota,
            iniciarRecontagem: input.iniciarRecontagem || false,
          },
          ...CONFERENCIA_CLIENT_EVENTS,
        },
      },
      correlationId,
      'mgecom',
    );

    const body = response.responseBody;

    // 2. Atualizar conferente na TGFCAB via DatasetSP.save
    if (input.nomeUsu) {
      try {
        await this.gateway.serviceCall(
          'DatasetSP.save',
          {
            serviceName: 'DatasetSP.save',
            requestBody: {
              entityName: 'CabecalhoNota',
              standAlone: false,
              fields: ['AD_USUARIOCONF'],
              records: [
                {
                  pk: { NUNOTA: input.nuNota },
                  values: { '0': input.nomeUsu },
                },
              ],
            },
          },
          correlationId,
        );
      } catch (err) {
        console.warn('[IniciarConferencia] Falha ao atualizar AD_USUARIOCONF:', (err as Error).message);
      }
    }

    return {
      numConf: body.numConf,
      numNota: body.numNota,
      tipMov: body.tipMov,
      isRecontagem: body.isRecontagem,
      tipoContagem: body.tipoContagem,
      vendedor: body.vendedor?.$ || '',
      parceiro: body.parceiro?.$ || '',
      configuracoes: {
        mostrarProdPed: body.mostrarProdPed,
        autoFeedback: body.autoFeedback,
        mostrarProdConf: body.mostrarProdConf,
        mostrarQtdPed: body.mostrarQtdPed,
        mostrarQtdConf: body.mostrarQtdConf,
        mostrarProdDiver: body.mostrarProdDiver,
        mostrarAlertaSonoroDivergencia: body.mostrarAlertaSonoroDivergencia,
        formacaoVolumes: body.formacaoVolumes,
        ignorarComponenteKit: body.ignorarComponenteKit,
        fatAoConcluir: body.fatAoConcluir,
        mostrarCodBarrasPed: body.mostrarCodBarrasPed,
        registrarPeso: body.registrarPeso,
        exigeIdentif: body.exigeIdentif,
        produtosForaPedido: body.produtosForaPedido,
      },
    };
  }
}
