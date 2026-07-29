import { IGatewayPort } from '../../../domain/ports/IGatewayPort.js';
import { LoadRecordInput, LoadRecordOutput } from '../../dtos/CrudDTOs.js';
import { parseLoadRecordResponse } from '../../helpers/sankhyaParser.js';

/**
 * Use Case: Carregar um único registro por chave primária
 * Usa CRUDServiceProvider.loadRecord no formato oficial Sankhya
 */
export class LoadRecordUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: LoadRecordInput, correlationId?: string): Promise<LoadRecordOutput> {
    const body = {
      serviceName: 'CRUDServiceProvider.loadRecord',
      requestBody: {
        dataSet: {
          rootEntity: input.rootEntity,
          entity: input.entity,
          rows: {
            row: input.primaryKey,
          },
        },
      },
    };

    const response = await this.gateway.serviceCall(
      'CRUDServiceProvider.loadRecord',
      body,
      correlationId,
    );

    const record = parseLoadRecordResponse(response.responseBody);

    return { record };
  }
}
