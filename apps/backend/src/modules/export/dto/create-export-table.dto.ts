import { IsString, IsOptional, IsEnum, IsUUID, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ExportFormat } from '../entities/export-table.entity';

class ColumnSchema {
  @IsString()
  name: string;

  @IsString()
  type: string;
}

export class CreateExportTableDto {
  @IsString()
  name: string;

  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnSchema)
  schema: ColumnSchema[];

  @IsArray()
  data: any[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  projectId?: string;

  @IsBoolean()
  @IsOptional()
  overwrite?: boolean;
}
