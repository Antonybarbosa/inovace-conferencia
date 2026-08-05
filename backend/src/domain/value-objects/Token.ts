/**
 * Value Object para Token
 * Encapsula um token JWT ou OAuth com metadata de expiração
 */
export interface TokenProps {
  value: string;
  expiresAt: Date;
}

export class Token {
  readonly value: string;
  readonly expiresAt: Date;

  constructor(props: TokenProps) {
    this.value = props.value;
    this.expiresAt = props.expiresAt;
  }

  isExpired(): boolean {
    return Date.now() >= this.expiresAt.getTime();
  }

  toString(): string {
    return this.value;
  }
}
