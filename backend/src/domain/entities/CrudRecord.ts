/**
 * Entidade genérica de registro CRUD
 * Representa qualquer registro de uma entidade do Sankhya
 */
export interface CrudRecordProps {
  entity: string;
  data: Record<string, unknown>;
  primaryKey?: Record<string, unknown>;
}

export class CrudRecord {
  readonly entity: string;
  readonly data: Record<string, unknown>;
  readonly primaryKey?: Record<string, unknown>;

  constructor(props: CrudRecordProps) {
    this.entity = props.entity;
    this.data = props.data;
    this.primaryKey = props.primaryKey;
  }

  hasKey(): boolean {
    return !!this.primaryKey && Object.keys(this.primaryKey).length > 0;
  }

  toJSON(): CrudRecordProps {
    return {
      entity: this.entity,
      data: this.data,
      primaryKey: this.primaryKey,
    };
  }
}
