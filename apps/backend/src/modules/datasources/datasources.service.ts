import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource, DataSourceStatus, DataSourceType } from './entities/datasource.entity';
import { CreateDataSourceDto } from './dto/create-datasource.dto';
import { UpdateDataSourceDto } from './dto/update-datasource.dto';
import * as XLSX from 'xlsx';
import csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatasourcesService {
  constructor(
    @InjectRepository(DataSource)
    private datasourceRepository: Repository<DataSource>,
  ) {}

  /**
   * 创建数据源记录
   */
  async create(dto: CreateDataSourceDto, ownerId: string): Promise<DataSource> {
    const datasource = this.datasourceRepository.create({
      ...dto,
      ownerId,
      status: DataSourceStatus.PENDING,
    });
    return this.datasourceRepository.save(datasource);
  }

  /**
   * 处理文件上传并解析 schema
   */
  async processFile(
    datasourceId: string,
    file: Express.Multer.File,
    uploadPath: string,
  ): Promise<DataSource> {
    const datasource = await this.findOne(datasourceId);
    if (!datasource) {
      throw new NotFoundException('Data source not found');
    }

    try {
      // 更新状态为处理中
      datasource.status = DataSourceStatus.PROCESSING;
      datasource.fileName = file.originalname;
      datasource.fileSize = file.size;
      datasource.filePath = uploadPath;
      await this.datasourceRepository.save(datasource);

      // 解析文件 schema
      const schema = await this.parseFileSchema(file, datasource.type);
      const rowCount = await this.countRows(file, datasource.type);

      // 更新数据源信息
      datasource.schema = schema;
      datasource.rowCount = rowCount;
      datasource.status = DataSourceStatus.COMPLETED;
      
      return this.datasourceRepository.save(datasource);
    } catch (error) {
      // 处理失败,更新状态
      datasource.status = DataSourceStatus.FAILED;
      await this.datasourceRepository.save(datasource);
      throw new BadRequestException(`File processing failed: ${error.message}`);
    }
  }

  /**
   * 解析文件 schema
   */
  private async parseFileSchema(
    file: Express.Multer.File,
    type: DataSourceType,
  ): Promise<{ columns: Array<{ name: string; type: string; nullable: boolean; example?: any }> }> {
    const filePath = file.path;

    if (type === DataSourceType.CSV) {
      return this.parseCSVSchema(filePath);
    } else if (type === DataSourceType.EXCEL) {
      return this.parseExcelSchema(filePath);
    }

    throw new BadRequestException('Unsupported file type');
  }

  /**
   * 解析 CSV 文件 schema
   */
  private async parseCSVSchema(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          if (results.length < 100) { // 只读取前100行用于推断类型
            results.push(data);
          }
        })
        .on('end', () => {
          if (results.length === 0) {
            reject(new Error('Empty CSV file'));
            return;
          }

          const firstRow = results[0];
          const columns = Object.keys(firstRow).map((columnName) => {
            const values = results.map((row) => row[columnName]).filter((v) => v !== null && v !== '');
            const type = this.inferColumnType(values);
            const example = values.length > 0 ? values[0] : null;

            return {
              name: columnName,
              type,
              nullable: values.length < results.length,
              example,
            };
          });

          resolve({ columns });
        })
        .on('error', reject);
    });
  }

  /**
   * 解析 Excel 文件 schema
   */
  private async parseExcelSchema(filePath: string): Promise<any> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      throw new BadRequestException('Empty Excel file');
    }

    const firstRow = jsonData[0];
    const columns = Object.keys(firstRow).map((columnName) => {
      const values = jsonData.map((row) => row[columnName]).filter((v) => v !== null && v !== undefined && v !== '');
      const type = this.inferColumnType(values);
      const example = values.length > 0 ? values[0] : null;

      return {
        name: columnName,
        type,
        nullable: values.length < jsonData.length,
        example,
      };
    });

    return { columns };
  }

  /**
   * 推断列的数据类型
   */
  private inferColumnType(values: any[]): string {
    if (values.length === 0) return 'string';

    const numericCount = values.filter((v) => !isNaN(Number(v))).length;
    const dateCount = values.filter((v) => !isNaN(Date.parse(v))).length;

    if (numericCount / values.length > 0.8) {
      // 检查是否为整数
      const isInteger = values.every((v) => Number.isInteger(Number(v)));
      return isInteger ? 'integer' : 'decimal';
    }

    if (dateCount / values.length > 0.8) {
      return 'date';
    }

    // 检查是否为布尔值
    const booleanValues = ['true', 'false', '1', '0', 'yes', 'no'];
    const isBooleanLike = values.every((v) => 
      booleanValues.includes(String(v).toLowerCase())
    );
    if (isBooleanLike) {
      return 'boolean';
    }

    return 'string';
  }

  /**
   * 统计行数
   */
  private async countRows(file: Express.Multer.File, type: DataSourceType): Promise<number> {
    const filePath = file.path;

    if (type === DataSourceType.CSV) {
      return new Promise((resolve, reject) => {
        let count = 0;
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', () => count++)
          .on('end', () => resolve(count))
          .on('error', reject);
      });
    } else if (type === DataSourceType.EXCEL) {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      return jsonData.length;
    }

    return 0;
  }

  /**
   * 获取所有数据源(可按项目过滤)
   */
  async findAll(ownerId: string, projectId?: string): Promise<DataSource[]> {
    const where: any = { ownerId, isActive: true };
    if (projectId) {
      where.projectId = projectId;
    }
    return this.datasourceRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取单个数据源
   */
  async findOne(id: string): Promise<DataSource> {
    const datasource = await this.datasourceRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!datasource) {
      throw new NotFoundException('Data source not found');
    }
    return datasource;
  }

  /**
   * 更新数据源
   */
  async update(id: string, dto: UpdateDataSourceDto, ownerId: string): Promise<DataSource> {
    const datasource = await this.findOne(id);
    if (datasource.ownerId !== ownerId) {
      throw new BadRequestException('You do not have permission to update this data source');
    }

    Object.assign(datasource, dto);
    return this.datasourceRepository.save(datasource);
  }

  /**
   * 删除数据源(软删除)
   */
  async remove(id: string, ownerId: string): Promise<void> {
    const datasource = await this.findOne(id);
    if (datasource.ownerId !== ownerId) {
      throw new BadRequestException('You do not have permission to delete this data source');
    }

    datasource.isActive = false;
    await this.datasourceRepository.save(datasource);
  }

  /**
   * 获取数据源预览数据
   */
  async getPreview(id: string, limit: number = 100): Promise<any[]> {
    const datasource = await this.findOne(id);
    
    if (!datasource.filePath || !fs.existsSync(datasource.filePath)) {
      throw new NotFoundException('File not found');
    }

    if (datasource.type === DataSourceType.CSV) {
      return this.getCSVPreview(datasource.filePath, limit);
    } else if (datasource.type === DataSourceType.EXCEL) {
      return this.getExcelPreview(datasource.filePath, limit);
    }

    return [];
  }

  /**
   * 获取 CSV 预览数据
   */
  private async getCSVPreview(filePath: string, limit: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          if (results.length < limit) {
            results.push(data);
          }
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  /**
   * 获取 Excel 预览数据
   */
  private async getExcelPreview(filePath: string, limit: number): Promise<any[]> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    return jsonData.slice(0, limit);
  }

  /**
   * 保存从数据库导入的数据
   */
  async saveImportedData(
    datasourceId: string,
    importData: { schema: any[]; data: any[]; rowCount: number },
  ): Promise<DataSource> {
    const datasource = await this.findOne(datasourceId);
    if (!datasource) {
      throw new NotFoundException('Data source not found');
    }

    try {
      datasource.status = DataSourceStatus.PROCESSING;
      await this.datasourceRepository.save(datasource);

      // 转换 schema 格式
      const schemaColumns = importData.schema.map((col) => ({
        name: col.name,
        type: col.type,
        nullable: true,
      }));

      datasource.schema = { columns: schemaColumns };
      datasource.rowCount = importData.rowCount;
      datasource.status = DataSourceStatus.COMPLETED;

      return this.datasourceRepository.save(datasource);
    } catch (error) {
      datasource.status = DataSourceStatus.FAILED;
      await this.datasourceRepository.save(datasource);
      throw new BadRequestException(`Failed to save imported data: ${error.message}`);
    }
  }
}
