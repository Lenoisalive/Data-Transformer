import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { DataSourceType } from '../entities/datasource.entity';

export class CreateDataSourceDto {
  @IsString()
  name: string;

  @IsEnum(DataSourceType)
  type: DataSourceType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  projectId?: string;
}
