import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ExportFormat, ExportStatus } from '../entities/export-table.entity';

export class UpdateExportTableDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(ExportFormat)
  @IsOptional()
  format?: ExportFormat;

  @IsEnum(ExportStatus)
  @IsOptional()
  status?: ExportStatus;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
