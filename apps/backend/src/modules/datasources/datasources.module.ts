import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatasourcesController } from './datasources.controller';
import { DatasourcesService } from './datasources.service';
import { DataSource } from './entities/datasource.entity';
import { DatabaseConnection } from './entities/database-connection.entity';
import { DatabaseImportService } from './database-import.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataSource, DatabaseConnection])],
  controllers: [DatasourcesController],
  providers: [DatasourcesService, DatabaseImportService],
  exports: [DatasourcesService, DatabaseImportService],
})
export class DatasourcesModule {}
