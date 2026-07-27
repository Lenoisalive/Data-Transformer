import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseConnection, DatabaseType } from './entities/database-connection.entity';
import { CreateDatabaseConnectionDto, TestConnectionDto, ImportFromDatabaseDto } from './dto/database-connection.dto';
import * as mysql from 'mysql2/promise';
import { Client as PgClient } from 'pg';

export interface TableInfo {
  name: string;
  rowCount: number;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
}

@Injectable()
export class DatabaseImportService {
  constructor(
    @InjectRepository(DatabaseConnection)
    private connectionRepository: Repository<DatabaseConnection>,
  ) {}

  async createConnection(dto: CreateDatabaseConnectionDto, userId: string): Promise<DatabaseConnection> {
    const connection = this.connectionRepository.create({
      ...dto,
      ownerId: userId,
    });
    return this.connectionRepository.save(connection);
  }

  async getAllConnections(userId: string): Promise<DatabaseConnection[]> {
    return this.connectionRepository.find({
      where: { ownerId: userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getConnection(id: string, userId: string): Promise<DatabaseConnection> {
    const connection = await this.connectionRepository.findOne({
      where: { id, ownerId: userId, isActive: true },
    });
    if (!connection) {
      throw new NotFoundException('Database connection not found');
    }
    return connection;
  }

  async deleteConnection(id: string, userId: string): Promise<void> {
    const connection = await this.getConnection(id, userId);
    connection.isActive = false;
    await this.connectionRepository.save(connection);
  }

  async testConnection(dto: TestConnectionDto): Promise<{ success: boolean; message: string }> {
    try {
      if (dto.type === DatabaseType.MYSQL) {
        await this.testMySQLConnection(dto);
      } else if (dto.type === DatabaseType.POSTGRES) {
        await this.testPostgresConnection(dto);
      } else {
        throw new BadRequestException(`Database type ${dto.type} is not supported yet`);
      }
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  private async testMySQLConnection(dto: TestConnectionDto): Promise<void> {
    const connection = await mysql.createConnection({
      host: dto.host,
      port: dto.port,
      user: dto.username,
      password: dto.password,
      database: dto.database,
      ssl: dto.ssl ? { rejectUnauthorized: false } : undefined,
    });
    await connection.ping();
    await connection.end();
  }

  private async testPostgresConnection(dto: TestConnectionDto): Promise<void> {
    const client = new PgClient({
      host: dto.host,
      port: dto.port,
      user: dto.username,
      password: dto.password,
      database: dto.database,
      ssl: dto.ssl ? { rejectUnauthorized: false } : undefined,
    });
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
  }

  async getTables(connectionId: string, userId: string): Promise<TableInfo[]> {
    const dbConnection = await this.getConnection(connectionId, userId);
    if (dbConnection.type === DatabaseType.MYSQL) {
      return this.getMySQLTables(dbConnection);
    } else if (dbConnection.type === DatabaseType.POSTGRES) {
      return this.getPostgresTables(dbConnection);
    }
    throw new BadRequestException(`Database type ${dbConnection.type} is not supported yet`);
  }

  private async getMySQLTables(dbConnection: DatabaseConnection): Promise<TableInfo[]> {
    const connection = await mysql.createConnection({
      host: dbConnection.host,
      port: dbConnection.port,
      user: dbConnection.username,
      password: dbConnection.password,
      database: dbConnection.database,
      ssl: dbConnection.ssl ? { rejectUnauthorized: false } : undefined,
    });

    try {
      const [tables] = await connection.query<any[]>(
        'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = "BASE TABLE"',
        [dbConnection.database]
      );

      const tableInfos: TableInfo[] = [];
      for (const table of tables) {
        const tableName = table.TABLE_NAME;
        const [countResult] = await connection.query<any[]>(`SELECT COUNT(*) as count FROM \`${tableName}\``);
        const rowCount = countResult[0].count;

        const [columns] = await connection.query<any[]>(
          'SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
          [dbConnection.database, tableName]
        );

        const columnInfos: ColumnInfo[] = columns.map((col) => ({
          name: col.COLUMN_NAME,
          type: col.DATA_TYPE,
          nullable: col.IS_NULLABLE === 'YES',
        }));

        tableInfos.push({ name: tableName, rowCount, columns: columnInfos });
      }
      return tableInfos;
    } finally {
      await connection.end();
    }
  }

  private async getPostgresTables(dbConnection: DatabaseConnection): Promise<TableInfo[]> {
    const client = new PgClient({
      host: dbConnection.host,
      port: dbConnection.port,
      user: dbConnection.username,
      password: dbConnection.password,
      database: dbConnection.database,
      ssl: dbConnection.ssl ? { rejectUnauthorized: false } : undefined,
    });

    await client.connect();
    try {
      const tablesResult = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`);
      const tableInfos: TableInfo[] = [];

      for (const row of tablesResult.rows) {
        const tableName = row.tablename;
        const countResult = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const rowCount = parseInt(countResult.rows[0].count);

        const columnsResult = await client.query(
          `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
          [tableName]
        );

        const columnInfos: ColumnInfo[] = columnsResult.rows.map((col) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
        }));

        tableInfos.push({ name: tableName, rowCount, columns: columnInfos });
      }
      return tableInfos;
    } finally {
      await client.end();
    }
  }

  async previewTableData(connectionId: string, tableName: string, userId: string, limit: number = 10): Promise<any[]> {
    const dbConnection = await this.getConnection(connectionId, userId);
    if (dbConnection.type === DatabaseType.MYSQL) {
      return this.previewMySQLTable(dbConnection, tableName, limit);
    } else if (dbConnection.type === DatabaseType.POSTGRES) {
      return this.previewPostgresTable(dbConnection, tableName, limit);
    }
    throw new BadRequestException(`Database type ${dbConnection.type} is not supported yet`);
  }

  private async previewMySQLTable(dbConnection: DatabaseConnection, tableName: string, limit: number): Promise<any[]> {
    const connection = await mysql.createConnection({
      host: dbConnection.host,
      port: dbConnection.port,
      user: dbConnection.username,
      password: dbConnection.password,
      database: dbConnection.database,
      ssl: dbConnection.ssl ? { rejectUnauthorized: false } : undefined,
    });

    try {
      const [rows] = await connection.query<any[]>(`SELECT * FROM \`${tableName}\` LIMIT ?`, [limit]);
      return rows;
    } finally {
      await connection.end();
    }
  }

  private async previewPostgresTable(dbConnection: DatabaseConnection, tableName: string, limit: number): Promise<any[]> {
    const client = new PgClient({
      host: dbConnection.host,
      port: dbConnection.port,
      user: dbConnection.username,
      password: dbConnection.password,
      database: dbConnection.database,
      ssl: dbConnection.ssl ? { rejectUnauthorized: false } : undefined,
    });

    await client.connect();
    try {
      const result = await client.query(`SELECT * FROM "${tableName}" LIMIT $1`, [limit]);
      return result.rows;
    } finally {
      await client.end();
    }
  }

  async importFromDatabase(dto: ImportFromDatabaseDto, userId: string): Promise<{ data: any[]; schema: any[] }> {
    const dbConnection = await this.getConnection(dto.connectionId, userId);
    if (dbConnection.type === DatabaseType.MYSQL) {
      return this.importFromMySQL(dbConnection, dto.tableName, dto.limit);
    } else if (dbConnection.type === DatabaseType.POSTGRES) {
      return this.importFromPostgres(dbConnection, dto.tableName, dto.limit);
    }
    throw new BadRequestException(`Database type ${dbConnection.type} is not supported yet`);
  }

  private async importFromMySQL(dbConnection: DatabaseConnection, tableName: string, limit?: number): Promise<{ data: any[]; schema: any[] }> {
    const connection = await mysql.createConnection({
      host: dbConnection.host,
      port: dbConnection.port,
      user: dbConnection.username,
      password: dbConnection.password,
      database: dbConnection.database,
      ssl: dbConnection.ssl ? { rejectUnauthorized: false } : undefined,
    });

    try {
      const [columns] = await connection.query<any[]>(
        'SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
        [dbConnection.database, tableName]
      );

      const schema = columns.map((col) => ({
        name: col.COLUMN_NAME,
        type: this.mapMySQLType(col.DATA_TYPE),
      }));

      const query = limit ? `SELECT * FROM \`${tableName}\` LIMIT ?` : `SELECT * FROM \`${tableName}\``;
      const params = limit ? [limit] : [];
      const [rows] = await connection.query<any[]>(query, params);

      return { data: rows, schema };
    } finally {
      await connection.end();
    }
  }

  private async importFromPostgres(dbConnection: DatabaseConnection, tableName: string, limit?: number): Promise<{ data: any[]; schema: any[] }> {
    const client = new PgClient({
      host: dbConnection.host,
      port: dbConnection.port,
      user: dbConnection.username,
      password: dbConnection.password,
      database: dbConnection.database,
      ssl: dbConnection.ssl ? { rejectUnauthorized: false } : undefined,
    });

    await client.connect();
    try {
      const columnsResult = await client.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
        [tableName]
      );

      const schema = columnsResult.rows.map((col) => ({
        name: col.column_name,
        type: this.mapPostgresType(col.data_type),
      }));

      const query = limit ? `SELECT * FROM "${tableName}" LIMIT $1` : `SELECT * FROM "${tableName}"`;
      const params = limit ? [limit] : [];
      const result = await client.query(query, params);

      return { data: result.rows, schema };
    } finally {
      await client.end();
    }
  }

  private mapMySQLType(mysqlType: string): string {
    const typeMap: { [key: string]: string } = {
      'int': 'number', 'bigint': 'number', 'smallint': 'number', 'tinyint': 'number',
      'decimal': 'number', 'float': 'numbe1r', 'double': 'number',
      'varchar': 'string', 'char': 'string', 'text': 'string',
      'date': 'date', 'datetime': 'datetime', 'timestamp': 'datetime',
      'boolean': 'boolean', 'json': 'json',
    };
    return typeMap[mysqlType.toLowerCase()] || 'string';
  }

  private mapPostgresType(pgType: string): string {
    const typeMap: { [key: string]: string } = {
      'integer': 'number', 'bigint': 'number', 'smallint': 'number',
      'numeric': 'number', 'real': 'number', 'double precision': 'number',
      'character varying': 'string', 'character': 'string', 'text': 'string',
      'date': 'date', 'timestamp': 'datetime',
      'timestamp without time zone': 'datetime', 'timestamp with time zone': 'datetime',
      'boolean': 'boolean', 'json': 'json', 'jsonb': 'json',
    };
    return typeMap[pgType.toLowerCase()] || 'string';
  }
}
