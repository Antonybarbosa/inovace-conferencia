import { IGatewayPort } from '../../../domain/ports/IGatewayPort.js';
import { ITokenPort } from '../../../domain/ports/ITokenPort.js';

export interface LoginSankhyaInput {
  usuario: string;
  senha: string;
}

export interface LoginSankhyaOutput {
  token: string;
  user: {
    codUsu: number;
    nomeUsu: string;
    jsessionid: string;
  };
}

/**
 * Use Case: Login de usuário Sankhya via MobileLoginSP
 * Autentica no ERP e retorna CODUSU + JWT para uso no frontend
 */
export class LoginSankhyaUseCase {
  constructor(
    private readonly gateway: IGatewayPort,
    private readonly tokenPort: ITokenPort,
  ) {}

  async execute(input: LoginSankhyaInput, correlationId?: string): Promise<LoginSankhyaOutput> {
    if (!input.usuario || !input.senha) {
      throw new Error('Usuário e senha são obrigatórios');
    }

    // 1. Autenticar no Sankhya via MobileLoginSP
    const response = await this.gateway.serviceCall<any>(
      'MobileLoginSP.login',
      {
        serviceName: 'MobileLoginSP.login',
        requestBody: {
          NOMUSU: { $: input.usuario },
          INTERNO: { $: input.senha },
        },
      },
      correlationId,
    );

    const body = response.responseBody;

    if (!body?.idusu?.$) {
      throw new Error('Credenciais inválidas');
    }

    // 2. Decodar CODUSU (vem em Base64)
    const codUsuBase64 = body.idusu.$.trim();
    const codUsu = parseInt(Buffer.from(codUsuBase64, 'base64').toString('utf-8'), 10);

    if (isNaN(codUsu)) {
      throw new Error('Erro ao decodificar ID do usuário');
    }

    const jsessionid = body.jsessionid?.$ || '';

    // 3. Gerar JWT com dados do usuário Sankhya
    const token = this.tokenPort.generate({
      userId: String(codUsu),
      username: input.usuario,
      email: `${input.usuario}@sankhya.local`,
    });

    return {
      token,
      user: {
        codUsu,
        nomeUsu: input.usuario,
        jsessionid,
      },
    };
  }
}
