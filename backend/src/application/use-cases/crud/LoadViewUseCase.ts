import { IGatewayPort } from '../../../domain/ports/IGatewayPort.js';
import { LoadViewInput, LoadViewOutput } from '../../dtos/CrudDTOs.js';
import { parseLoadRecordsResponse } from '../../helpers/sankhyaParser.js';

/**
 * Use Case: Carregar dados de uma view/consulta
 * Usa o mesmo CRUDServiceProvider.loadRecords com a view como rootEntity
 */
export class LoadViewUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: LoadViewInput, correlationId?: string): Promise<LoadViewOutput> {
    const body = {
      serviceName: 'CRUDServiceProvider.loadRecords',
      requestBody: {
        dataSet: {
          rootEntity: input.viewName,
          includePresentationFields: 'N',
          offsetPage: String(input.offsetPage ?? 0),
          entity: input.entity,
          ...(input.criteria ? { criteria: input.criteria } : {}),
        },
      },
    };

    const response = await this.gateway.serviceCall(
      'CRUDServiceProvider.loadRecords',
      body,
      correlationId,
    );

    const parsed = parseLoadRecordsResponse(response.responseBody);

    return {
      records: parsed.records,
      total: parsed.total,
      hasMoreResult: parsed.hasMoreResult,
    };
  }
}
