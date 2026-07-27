import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectTableDto } from './dto/create-project-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.projectsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.id);
  }

  // Project Tables endpoints
  @Post(':id/tables')
  addTable(
    @Param('id') id: string,
    @Body() createTableDto: CreateProjectTableDto,
    @Request() req,
  ) {
    return this.projectsService.addTable(id, createTableDto, req.user.id);
  }

  @Get(':id/tables')
  getTables(@Param('id') id: string, @Request() req) {
    return this.projectsService.getTables(id, req.user.id);
  }

  @Delete(':id/tables/:tableId')
  removeTable(
    @Param('id') id: string,
    @Param('tableId') tableId: string,
    @Request() req,
  ) {
    return this.projectsService.removeTable(id, tableId, req.user.id);
  }
}
