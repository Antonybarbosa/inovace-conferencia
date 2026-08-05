import axios, { AxiosInstance } from 'axios';
import { IGatewayPort, GatewayRequestOptions, SankhyaServiceResponse } from '../../domain/ports/IGatewayPort.js';
import { Token } from '../../domain/value-objects/Token.js';

export interface GatewayConfig {
  url: string;
  clientId: string;
  clientSecret: string;
  xToken: string;
}

/** Caminho base para chamadas ao mge/service.sbr */
const MGE_ENDPOINT = '/gateway/v1/mge/service.sbr';
/** Caminho base para chamadas ao mgecom/service.sbr (módulo comercial) */
const MGECOM_ENDPOINT = '/gateway/v1/mgecom/service.sbr';

/**
 * Adapter concreto para comunicação com o Gateway Sankhya
 * Implementa o IGatewayPort definido no domínio
 */
export class SankhyaGatewayAdapter implements IGatewayPort {
  private client: AxiosInstance;
  private token: Token | null = null;
  private authPromise: Promise<string> | null = null;

  constructor(private readonly config: GatewayConfig) {
    this.client = axios.create({
      baseURL: config.url,
      timeout: 30000,
    });
  }

  /**
   * Chamada dedicada ao mge/service.sbr
   * Encapsula endpoint + query params do serviceName + parse de erros Sankhya
   */
  async serviceCall<T = unknown>(
    serviceName: string,
    body: unknown,
    correlationId?: string,
    module: 'mge' | 'mgecom' = 'mge',
    mgeSession?: string,
  ): Promise<SankhyaServiceResponse<T>> {
    const endpoint = module === 'mgecom' ? MGECOM_ENDPOINT : MGE_ENDPOINT;
    const sessionParam = mgeSession ? `&mgeSession=${mgeSession}` : '';

    const response = await this.request<SankhyaServiceResponse<T>>(
      'post',
      `${endpoint}?serviceName=${serviceName}&outputType=json${sessionParam}`,
      body,
      { correlationId },
    );

    // Sankhya retorna status "0" para erro e "1" para sucesso
    if (response.status === '0') {
      const msg = response.statusMessage || 'Erro desconhecido no serviço Sankhya';
      throw new Error(`[Sankhya ${serviceName}] ${msg}`);
    }

    return response;
  }

  async get<T>(endpoint: string, options?: GatewayRequestOptions): Promise<T> {
    return this.request<T>('get', endpoint, undefined, options);
  }

  async post<T>(endpoint: string, data: unknown, options?: GatewayRequestOptions): Promise<T> {
    return this.request<T>('post', endpoint, data, options);
  }

  async put<T>(endpoint: string, data: unknown, options?: GatewayRequestOptions): Promise<T> {
    return this.request<T>('put', endpoint, data, options);
  }

  async patch<T>(endpoint: string, data: unknown, options?: GatewayRequestOptions): Promise<T> {
    return this.request<T>('patch', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: GatewayRequestOptions): Promise<T> {
    return this.request<T>('delete', endpoint, undefined, options);
  }

  async getImage(endpoint: string, correlationId?: string): Promise<Buffer | null> {
    const accessToken = await this.getValidToken();

    try {
      const response = await this.client.get(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'image/jpeg',
          ...(correlationId ? { 'X-Correlation-ID': correlationId } : {}),
        },
        responseType: 'arraybuffer',
      });

      if (response.data && response.data.length > 0) {
        return Buffer.from(response.data);
      }
      return null;
    } catch {
      return null;
    }
  }

  private async request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    data?: unknown,
    options?: GatewayRequestOptions,
  ): Promise<T> {
    const accessToken = await this.getValidToken();

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    if (options?.correlationId) {
      headers['X-Correlation-ID'] = options.correlationId;
    }

    try {
      const response = await this.client.request<T>({
        method,
        url: endpoint,
        data,
        headers,
        params: options?.params,
      });

      return response.data;
    } catch (error: any) {
      // Se token expirou, renova e tenta novamente
      if (error.response?.status === 401) {
        console.warn('[GatewayAdapter] Token expirado, renovando...');
        this.token = null;
        const newToken = await this.getValidToken();

        headers.Authorization = `Bearer ${newToken}`;

        const retryResponse = await this.client.request<T>({
          method,
          url: endpoint,
          data,
          headers,
          params: options?.params,
        });

        return retryResponse.data;
      }

      console.error(`[GatewayAdapter] Erro ${method.toUpperCase()} ${endpoint}:`, error.message);
      throw error;
    }
  }

  private async getValidToken(): Promise<string> {
    if (this.token && !this.token.isExpired()) {
      return this.token.value;
    }

    if (this.authPromise) {
      return this.authPromise;
    }

    this.authPromise = this.authenticate();
    try {
      return await this.authPromise;
    } finally {
      this.authPromise = null;
    }
  }

  private async authenticate(): Promise<string> {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', this.config.clientId);
    params.append('client_secret', this.config.clientSecret);

    const response = await axios.post(
      `${this.config.url}/authenticate`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Token': this.config.xToken,
        },
        timeout: 30000,
      },
    );

    const expiresInSec = response.data.expires_in;
    console.log(`[GatewayAdapter] Token obtido — expires_in: ${expiresInSec}s`);

    this.token = new Token({
      value: response.data.access_token,
      expiresAt: new Date(Date.now() + expiresInSec * 1000),
    });

    return this.token.value;
  }
}
