// User-related types
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',        // Full access: manage users, all operations
  ENGINEER = 'engineer',  // Most CRUD operations, no user management
  ANALYST = 'analyst',    // Read-only access, can view all data
}

// Data source types
export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  config: DataSourceConfig;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
}

export enum DataSourceType {
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  ORACLE = 'oracle',
  MSSQL = 'mssql',
  MONGODB = 'mongodb',
}

export interface DataSourceConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

// Query builder types
export interface QueryBuilder {
  id?: string;
  name: string;
  dataSourceId: string;
  tables: TableSelection[];
  fields: FieldSelection[];
  filters: FilterCondition[];
  joins: JoinCondition[];
  orderBy: OrderByClause[];
  limit?: number;
}

export interface TableSelection {
  schema?: string;
  table: string;
  alias?: string;
}

export interface FieldSelection {
  table: string;
  field: string;
  alias?: string;
  transformation?: FieldTransformation;
}

export interface FieldTransformation {
  type: TransformationType;
  params: Record<string, any>;
}

export enum TransformationType {
  RENAME = 'rename',
  CAST = 'cast',
  SUBSTRING = 'substring',
  CONCAT = 'concat',
  DATE_FORMAT = 'date_format',
  CASE_WHEN = 'case_when',
}

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
  logic?: 'AND' | 'OR';
}

export enum FilterOperator {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  LIKE = 'LIKE',
  IN = 'IN',
  IS_NULL = 'IS NULL',
}

export interface JoinCondition {
  type: JoinType;
  leftTable: string;
  rightTable: string;
  leftField: string;
  rightField: string;
}

export enum JoinType {
  INNER = 'INNER',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  FULL = 'FULL',
}

export interface OrderByClause {
  field: string;
  direction: 'ASC' | 'DESC';
}

// Export job types
export interface ExportJob {
  id: string;
  userId: string;
  query: QueryBuilder;
  format: ExportFormat;
  status: JobStatus;
  fileUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export {};
