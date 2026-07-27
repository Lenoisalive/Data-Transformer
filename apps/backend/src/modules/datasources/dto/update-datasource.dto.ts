import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { DataSourceType, DataSourceStatus } from '../entities/datasource.entity';

export class UpdateDataSourceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(DataSourceType)
  @IsOptional()
  type?: DataSourceType;

  @IsEnum(DataSourceStatus)
  @IsOptional()
  status?: DataSourceStatus;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
