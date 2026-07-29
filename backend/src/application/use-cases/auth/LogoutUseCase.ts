export interface LogoutOutput {
  message: string;
}

export class LogoutUseCase {
  async execute(): Promise<LogoutOutput> {
    // Em uma implementação futura, podemos invalidar o token em uma blacklist
    return { message: 'Logout realizado com sucesso' };
  }
}
