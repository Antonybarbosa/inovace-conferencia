import { IGatewayPort } from '../../../domain/ports/IGatewayPort.js';
import { LoadRecordsInput, LoadRecordsOutput } from '../../dtos/CrudDTOs.js';
import { parseLoadRecordsResponse } from '../../helpers/sankhyaParser.js';

/**
 * Use Case: Listar registros de uma entidade
 * Usa CRUDServiceProvider.loadRecords no formato oficial Sankhya
 */
export class LoadRecordsUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: LoadRecordsInput, correlationId?: string): Promise<LoadRecordsOutput> {
    const body = {
      serviceName: 'CRUDServiceProvider.loadRecords',
      requestBody: {
        dataSet: {
          rootEntity: input.rootEntity,
          includePresentationFields: input.includePresentationFields || 'N',
          offsetPage: String(input.offsetPage ?? 0),
          entity: input.entity,
          ...(input.criteria ? { criteria: input.criteria } : {}),
          ...(input.orderBy ? { orderBy: { $: input.orderBy } } : {}),
        },
      },
    };

    const response = await this.gateway.serviceCall(
      'CRUDServiceProvider.loadRecords',
      body,
      correlationId,
    );

    return parseLoadRecordsResponse(response.responseBody);
  }
}
