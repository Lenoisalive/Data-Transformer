import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { ProjectTable } from './entities/project-table.entity';
import { User } from '../users/entities/user.entity';
import { DataSource } from '../datasources/entities/datasource.entity';
import { ExportTable } from '../export/entities/export-table.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectTable, User, DataSource, ExportTable])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
