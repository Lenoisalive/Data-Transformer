import { IsNotEmpty, IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TableType } from '../entities/project-table.entity';

export class CreateProjectTableDto {
  @IsNotEmpty()
  @IsString()
  tableName: string;

  @IsNotEmpty()
  @IsEnum(TableType)
  tableType: TableType;

  @IsOptional()
  @IsUUID()
  datasourceId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  schema?: any;
}
