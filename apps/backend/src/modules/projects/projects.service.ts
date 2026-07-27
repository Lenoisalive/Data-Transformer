import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectTable } from './entities/project-table.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectTableDto } from './dto/create-project-table.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectTable)
    private projectTablesRepository: Repository<ProjectTable>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto, ownerId: string): Promise<Project> {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      ownerId,
    });

    // Add members if provided
    if (createProjectDto.memberIds && createProjectDto.memberIds.length > 0) {
      const members = await this.usersRepository.findBy({
        id: In(createProjectDto.memberIds),
      });
      project.members = members;
    }

    return this.projectsRepository.save(project);
  }

  async findAll(userId: string): Promise<Project[]> {
    // Find projects where user is owner or member
    return this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('project.tables', 'tables')
      .where('project.ownerId = :userId', { userId })
      .orWhere('members.id = :userId', { userId })
      .orderBy('project.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('project.tables', 'tables')
      .where('project.id = :id', { id })
      .getOne();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Check if user has access to this project
    const hasAccess =
      project.ownerId === userId ||
      project.members.some((member) => member.id === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.findOne(id, userId);

    // Check if user is owner
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can update the project');
    }

    // Update members if provided
    if (updateProjectDto.memberIds) {
      const members = await this.usersRepository.findBy({
        id: In(updateProjectDto.memberIds),
      });
      project.members = members;
    }

    Object.assign(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id, userId);

    // Check if user is owner
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the project owner can delete the project');
    }

    await this.projectsRepository.remove(project);
  }

  // Project Tables operations
  async addTable(projectId: string, createTableDto: CreateProjectTableDto, userId: string): Promise<ProjectTable> {
    // Verify user has access to project
    await this.findOne(projectId, userId);

    const table = this.projectTablesRepository.create({
      ...createTableDto,
      projectId,
    });

    return this.projectTablesRepository.save(table);
  }

  async getTables(projectId: string, userId: string): Promise<ProjectTable[]> {
    // Verify user has access to project
    await this.findOne(projectId, userId);

    return this.projectTablesRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }

  async removeTable(projectId: string, tableId: string, userId: string): Promise<void> {
    // Verify user has access to project
    await this.findOne(projectId, userId);

    const table = await this.projectTablesRepository.findOne({
      where: { id: tableId, projectId },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found in this project`);
    }

    await this.projectTablesRepository.remove(table);
  }
}
