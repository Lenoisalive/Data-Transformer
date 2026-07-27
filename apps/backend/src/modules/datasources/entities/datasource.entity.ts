import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DataSourceType {
  CSV = 'csv',
  EXCEL = 'excel',
  DATABASE = 'database',
  API = 'api',
}

export enum DataSourceStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('datasources')
export class DataSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: DataSourceType,
    default: DataSourceType.CSV,
  })
  type: DataSourceType;

  @Column({
    type: 'enum',
    enum: DataSourceStatus,
    default: DataSourceStatus.PENDING,
  })
  status: DataSourceStatus;

  @Column({ nullable: true })
  filePath: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ type: 'jsonb', nullable: true })
  schema: {
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      example?: any;
    }>;
  };

  @Column({ type: 'int', default: 0 })
  rowCount: number;

  @Column({ nullable: true })
  projectId: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
