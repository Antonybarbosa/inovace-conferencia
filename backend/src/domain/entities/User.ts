/**
 * Entidade de Usuário
 * Representa um usuário autenticado no sistema
 */
export interface UserProps {
  id: string;
  username: string;
  email: string;
}

export class User {
  readonly id: string;
  readonly username: string;
  readonly email: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
  }

  toJSON(): UserProps {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
    };
  }
}
