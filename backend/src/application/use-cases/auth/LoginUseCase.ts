import { IAuthPort } from '../../../domain/ports/IAuthPort.js';
import { ITokenPort } from '../../../domain/ports/ITokenPort.js';
import { LoginInput, LoginOutput } from '../../dtos/AuthDTOs.js';

export class LoginUseCase {
  constructor(
    private readonly authPort: IAuthPort,
    private readonly tokenPort: ITokenPort,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    if (!input.username || !input.password) {
      throw new Error('Username e password são obrigatórios');
    }

    const user = await this.authPort.validateCredentials(input.username, input.password);

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const token = this.tokenPort.generate({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    return {
      token,
      user: user.toJSON(),
    };
  }
}
