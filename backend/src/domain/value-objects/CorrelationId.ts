import { v4 as uuidv4 } from 'uuid';

/**
 * Value Object para Correlation ID
 * Identifica de forma única uma requisição através de todas as camadas
 */
export class CorrelationId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(existing?: string): CorrelationId {
    return new CorrelationId(existing || uuidv4());
  }

  toString(): string {
    return this.value;
  }

  equals(other: CorrelationId): boolean {
    return this.value === other.value;
  }
}
