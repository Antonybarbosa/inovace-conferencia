import { IGatewayPort } from '../../../domain/ports/IGatewayPort.js';
import { RemoveRecordInput, RemoveRecordOutput } from '../../dtos/CrudDTOs.js';

/**
 * Use Case: Remover um registro por chave primária
 * Usa CRUDServiceProvider.removeRecord no formato oficial Sankhya
 */
export class RemoveRecordUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(input: RemoveRecordInput, correlationId?: string): Promise<RemoveRecordOutput> {
    if (!input.primaryKey || Object.keys(input.primaryKey).length === 0) {
      throw new Error('Chave primária é obrigatória para remoção');
    }

    const body = {
      serviceName: 'CRUDServiceProvider.removeRecord',
      requestBody: {
        dataSet: {
          rootEntity: input.rootEntity,
          dataRow: {
            localFields: input.primaryKey,
          },
        },
      },
    };

    await this.gateway.serviceCall(
      'CRUDServiceProvider.removeRecord',
      body,
      correlationId,
    );

    return { success: true };
  }
}
