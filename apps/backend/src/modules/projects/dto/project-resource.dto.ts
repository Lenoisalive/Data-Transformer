import { IsEnum, IsUUID } from 'class-validator';

export enum ProjectResourceType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export class ProjectResourceDto {
  @IsEnum(ProjectResourceType)
  resourceType: ProjectResourceType;

  @IsUUID()
  resourceId: string;
}
