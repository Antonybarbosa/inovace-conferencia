import { IGatewayPort } from '../../../domain/ports/IGatewayPort.js';
import { SaveRecordInput, SaveRecordOutput } from '../../dtos/CrudDTOs.js';

/**
 * Use Case: Criar ou atualizar um registro
 * Usa CRUDServiceProvider.saveRecord no formato oficial Sankhya
 */
export class SaveRecordUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: SaveRecordInput, correlationId?: string): Promise<SaveRecordOutput> {
    const body = {
      serviceName: 'CRUDServiceProvider.saveRecord',
      requestBody: {
        dataSet: {
          rootEntity: input.rootEntity,
          includePresentationFields: 'S',
          dataRow: {
            localFields: input.data,
          },
        },
      },
    };

    const response = await this.gateway.serviceCall(
      'CRUDServiceProvider.saveRecord',
      body,
      correlationId,
    );

    // Extrair registro salvo da resposta
    const saved = response.responseBody as any;
    const record = saved?.entities?.entity || input.data;

    return {
      success: true,
      record: this.flattenRecord(record),
    };
  }

  private flattenRecord(raw: any): Record<string, unknown> {
    if (!raw || typeof raw !== 'object') return {};

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (key === '_rmd') continue;
      if (value && typeof value === 'object' && '$' in (value as any)) {
        result[key] = (value as any).$;
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}
