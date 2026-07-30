import { IGatewayPort } from '../../../domain/ports/IGatewayPort.js';

/**
 * Use Case: Buscar imagem do produto via endpoint .dbimage do Gateway
 * URL: /gateway/v1/mge/Produto@IMAGEM@CODPROD={codProd}.dbimage
 */
export class GetProdutoImagemUseCase {
  constructor(private readonly gateway: IGatewayPort) {}

  async execute(codProd: string, correlationId?: string): Promise<Buffer | null> {
    try {
      const response = await this.gateway.getImage(
        `/gateway/v1/mge/Produto@IMAGEM@CODPROD=${codProd}.dbimage`,
        correlationId,
      );
      return response;
    } catch {
      return null;
    }
  }
}
