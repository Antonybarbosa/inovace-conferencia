/**
 * Port (interface) para comunicação com o Gateway Sankhya
 * A implementação concreta fica na camada de infraestrutura
 */
export interface GatewayRequestOptions {
  correlationId?: string;
  params?: Record<string, string>;
}

/**
 * Resposta padrão de um serviço Sankhya (mge/service.sbr)
 */
export interface SankhyaServiceResponse<T = unknown> {
  serviceName: string;
  status: string;
  pendingPrinting: string;
  transactionId: string;
  statusMessage?: string;
  responseBody?: T;
}

export interface IGatewayPort {
  /** Chamada genérica HTTP */
  get<T>(endpoint: string, options?: GatewayRequestOptions): Promise<T>;
  post<T>(endpoint: string, data: unknown, options?: GatewayRequestOptions): Promise<T>;
  put<T>(endpoint: string, data: unknown, options?: GatewayRequestOptions): Promise<T>;
  patch<T>(endpoint: string, data: unknown, options?: GatewayRequestOptions): Promise<T>;
  delete<T>(endpoint: string, options?: GatewayRequestOptions): Promise<T>;

  /**
   * Chamada dedicada ao mge/service.sbr do Sankhya
   * Encapsula endpoint + query params do serviceName
   * @param module 'mge' (padrão) ou 'mgecom' (módulo comercial)
   * @param mgeSession Sessão do usuário Sankhya (para chamadas em nome do usuário)
   */
  serviceCall<T = unknown>(
    serviceName: string,
    body: unknown,
    correlationId?: string,
    module?: 'mge' | 'mgecom',
    mgeSession?: string,
  ): Promise<SankhyaServiceResponse<T>>;

  /** Busca imagem (binário) de um endpoint do Gateway */
  getImage(endpoint: string, correlationId?: string): Promise<Buffer | null>;
}
