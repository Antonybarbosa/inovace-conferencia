/**
 * Parser de respostas do CRUDServiceProvider Sankhya
 *
 * O Sankhya retorna campos como f0, f1, f2... com valores em { $: "valor" }
 * O metadata.fields.field[] mapeia a ordem: f0 → primeiro campo, f1 → segundo, etc.
 */

interface SankhyaField {
  name: string;
}

interface SankhyaEntity {
  [key: string]: { $: string } | unknown;
}

interface SankhyaLoadRecordsResponse {
  entities?: {
    total?: string;
    hasMoreResult?: string;
    offsetPage?: string;
    offset?: string;
    metadata?: {
      fields?: {
        field?: SankhyaField[];
      };
    };
    entity?: SankhyaEntity[] | SankhyaEntity;
  };
}

interface SankhyaLoadRecordResponse {
  entities?: {
    total?: string;
    entity?: SankhyaEntity;
  };
}

export interface ParsedRecords {
  records: Record<string, unknown>[];
  total: number;
  hasMoreResult: boolean;
  offsetPage: number;
  metadata: { name: string }[];
}

/**
 * Parse da resposta de loadRecords
 * Transforma f0.$, f1.$... em objetos com nomes reais dos campos
 */
export function parseLoadRecordsResponse(responseBody: unknown): ParsedRecords {
  const body = responseBody as SankhyaLoadRecordsResponse;

  if (!body?.entities) {
    return { records: [], total: 0, hasMoreResult: false, offsetPage: 0, metadata: [] };
  }

  const { entities } = body;
  const metadata = entities.metadata?.fields?.field || [];
  const total = parseInt(entities.total || '0', 10);
  const hasMoreResult = entities.hasMoreResult === 'true';
  const offsetPage = parseInt(entities.offsetPage || '0', 10);

  // entities.entity pode ser array ou objeto único
  let rawEntities: SankhyaEntity[] = [];
  if (Array.isArray(entities.entity)) {
    rawEntities = entities.entity;
  } else if (entities.entity) {
    rawEntities = [entities.entity];
  }

  const records = rawEntities.map((raw) => {
    const record: Record<string, unknown> = {};

    metadata.forEach((field, index) => {
      const key = `f${index}`;
      const value = raw[key];
      if (value && typeof value === 'object' && '$' in value) {
        record[field.name] = (value as { $: string }).$;
      } else {
        record[field.name] = null;
      }
    });

    return record;
  });

  return {
    records,
    total,
    hasMoreResult,
    offsetPage,
    metadata: metadata.map((f) => ({ name: f.name })),
  };
}

/**
 * Parse da resposta de loadRecord
 * Campos vêm como CAMPO: { $: "valor" }
 */
export function parseLoadRecordResponse(responseBody: unknown): Record<string, unknown> | null {
  const body = responseBody as SankhyaLoadRecordResponse;

  if (!body?.entities?.entity) {
    return null;
  }

  const raw = body.entities.entity;
  const record: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw)) {
    // Ignora _rmd (metadata interno)
    if (key === '_rmd') continue;

    if (value && typeof value === 'object' && '$' in value) {
      record[key] = (value as { $: string }).$;
    }
  }

  return record;
}
