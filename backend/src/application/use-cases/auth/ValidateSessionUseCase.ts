import { ITokenPort } from '../../../domain/ports/ITokenPort.js';
import { ValidateSessionInput, ValidateSessionOutput } from '../../dtos/AuthDTOs.js';

export class ValidateSessionUseCase {
  constructor(private readonly tokenPort: ITokenPort) {}

  execute(input: ValidateSessionInput): ValidateSessionOutput {
    const payload = this.tokenPort.extractFromHeader(input.authHeader);

    if (!payload) {
      throw new Error('Token inválido ou expirado');
    }

    return {
      user: {
        userId: payload.userId,
        username: payload.username,
        email: payload.email,
      },
    };
  }
}
