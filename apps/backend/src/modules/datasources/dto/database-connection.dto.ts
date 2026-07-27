import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export enum DatabaseType {
  MYSQL = 'mysql',
  POSTGRES = 'postgres',
  MSSQL = 'mssql',
  ORACLE = 'oracle',
}

export class CreateDatabaseConnectionDto {
  @IsString()
  name: string;

  @IsEnum(DatabaseType)
  type: DatabaseType;

  @IsString()
  host: string;

  @IsNumber()
  port: number;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  database: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  ssl?: boolean;
}

export class TestConnectionDto {
  @IsEnum(DatabaseType)
  type: DatabaseType;

  @IsString()
  host: string;

  @IsNumber()
  port: number;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  database: string;

  @IsOptional()
  @IsBoolean()
  ssl?: boolean;
}

export class ImportFromDatabaseDto {
  @IsString()
  connectionId: string;

  @IsString()
  tableName: string;

  @IsString()
  importTableName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  limit?: number; // 限制导入行数，用于测试
}
