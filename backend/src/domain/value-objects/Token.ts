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
    // Margem de 5 minutos para renovação antecipada
    const margin = 5 * 60 * 1000;
    return Date.now() >= this.expiresAt.getTime() - margin;
  }

  toString(): string {
    return this.value;
  }
}
