import { IGatewayPort } from '../../../domain/ports/IGatewayPort.js';
import { GatewayProxyInput, GatewayProxyOutput } from '../../dtos/CrudDTOs.js';

/**
 * Use Case para proxy genérico ao Gateway Sankhya
 * Encaminha requisições HTTP diretamente para endpoints do Gateway
 */
export class GatewayProxyUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute<T = unknown>(input: GatewayProxyInput): Promise<GatewayProxyOutput<T>> {
    const options = {
      correlationId: input.correlationId,
      params: input.params,
    };

    let data: T;

    switch (input.method) {
      case 'get':
        data = await this.gateway.get<T>(input.endpoint, options);
        break;
      case 'post':
        data = await this.gateway.post<T>(input.endpoint, input.data, options);
        break;
      case 'put':
        data = await this.gateway.put<T>(input.endpoint, input.data, options);
        break;
      case 'patch':
        data = await this.gateway.patch<T>(input.endpoint, input.data, options);
        break;
      case 'delete':
        data = await this.gateway.delete<T>(input.endpoint, options);
        break;
      default:
        throw new Error(`Método HTTP não suportado: ${input.method}`);
    }

    return {
      data,
      statusCode: 200,
    };
  }
}
