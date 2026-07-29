/**
 * DTOs para operações CRUD — formato oficial CRUDServiceProvider Sankhya
 *
 * Ref: https://developer.sankhya.com.br/reference/get_loadrecords
 */

// ─── Tipos auxiliares do formato Sankhya ─────────────────────────────────

/** Referência a uma entidade relacionada (JOIN) */
export interface EntityPath {
  /** "" para a entidade raiz, ou nome da entidade relacionada (ex: "Parceiro", "Cidade") */
  path: string;
  /** Campos a retornar, separados por vírgula */
  fieldset: { list: string };
}

/** Parâmetro de critério com tipo */
export interface CriteriaParameter {
  /** Valor do parâmetro */
  $: string;
  /** Tipo: I=inteiro, S=string, F=float, H=data */
  type: 'I' | 'S' | 'F' | 'H';
}

/** Critério de filtro (WHERE) */
export interface Criteria {
  /** Expressão SQL com placeholders ? */
  expression: { $: string };
  /** Valores dos parâmetros (na ordem dos ?) */
  parameter?: CriteriaParameter[];
}

// ─── loadRecords ─────────────────────────────────────────────────────────

export interface LoadRecordsInput {
  /** Nome da entidade raiz (ex: "CabecalhoNota", "Parceiro") */
  rootEntity: string;
  /** Campos e entidades relacionadas */
  entity: EntityPath[];
  /** Filtro (opcional) */
  criteria?: Criteria;
  /** Página (começa em 0) */
  offsetPage?: number;
  /** Incluir campos de apresentação */
  includePresentationFields?: 'S' | 'N';
  /** Ordenação (opcional) */
  orderBy?: string;
}

export interface LoadRecordsOutput {
  records: Record<string, unknown>[];
  total: number;
  hasMoreResult: boolean;
  offsetPage: number;
  metadata: { name: string }[];
}

// ─── loadRecord ──────────────────────────────────────────────────────────

export interface LoadRecordInput {
  /** Nome da entidade raiz */
  rootEntity: string;
  /** Campos e entidades relacionadas */
  entity: EntityPath[];
  /** Chave primária no formato { CAMPO: { $: "valor" } } */
  primaryKey: Record<string, { $: string }>;
}

export interface LoadRecordOutput {
  record: Record<string, unknown> | null;
}

// ─── saveRecord ──────────────────────────────────────────────────────────

export interface SaveRecordInput {
  /** Nome da entidade raiz */
  rootEntity: string;
  /** Dados do registro no formato { CAMPO: { $: "valor" } } */
  data: Record<string, { $: string }>;
}

export interface SaveRecordOutput {
  success: boolean;
  record: Record<string, unknown>;
}

// ─── removeRecord ────────────────────────────────────────────────────────

export interface RemoveRecordInput {
  /** Nome da entidade raiz */
  rootEntity: string;
  /** Chave primária no formato { CAMPO: { $: "valor" } } */
  primaryKey: Record<string, { $: string }>;
}

export interface RemoveRecordOutput {
  success: boolean;
}

// ─── loadView (usa loadRecords com entidade de view) ─────────────────────

export interface LoadViewInput {
  /** Nome da view/entidade */
  viewName: string;
  /** Campos */
  entity: EntityPath[];
  /** Filtro (opcional) */
  criteria?: Criteria;
  /** Página */
  offsetPage?: number;
}

export interface LoadViewOutput {
  records: Record<string, unknown>[];
  total: number;
  hasMoreResult: boolean;
}

// ─── Proxy genérico (mantido) ────────────────────────────────────────────

export interface GatewayProxyInput {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  endpoint: string;
  data?: unknown;
  correlationId?: string;
  params?: Record<string, string>;
}

export interface GatewayProxyOutput<T = unknown> {
  data: T;
  statusCode: number;
}
