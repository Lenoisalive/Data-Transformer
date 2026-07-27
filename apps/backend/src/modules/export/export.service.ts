import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportTable, ExportStatus, ExportFormat } from './entities/export-table.entity';
import { CreateExportTableDto } from './dto/create-export-table.dto';
import { UpdateExportTableDto } from './dto/update-export-table.dto';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(ExportTable)
    private exportTableRepository: Repository<ExportTable>,
  ) {}

  /**
   * 创建导出表记录
   */
  async create(dto: CreateExportTableDto, ownerId: string): Promise<ExportTable> {
    if (dto.overwrite) {
      await this.exportTableRepository.update(
        {
          ownerId,
          projectId: dto.projectId,
          name: dto.name,
          isActive: true,
        },
        { isActive: false },
      );
    }

    const exportTable = this.exportTableRepository.create({
      name: dto.name,
      format: dto.format,
      schema: { columns: dto.schema },
      data: dto.data,
      rowCount: dto.data.length,
      description: dto.description,
      projectId: dto.projectId,
      ownerId,
      status: ExportStatus.PENDING,
    });

    const saved = await this.exportTableRepository.save(exportTable);

    // 异步生成文件
    this.generateFile(saved.id).catch((error) => {
      console.error('Error generating export file:', error);
    });

    return saved;
  }

  /**
   * 生成导出文件
   */
  private async generateFile(exportTableId: string): Promise<void> {
    const exportTable = await this.findOne(exportTableId);

    try {
      // 更新状态为处理中
      exportTable.status = ExportStatus.PROCESSING;
      await this.exportTableRepository.save(exportTable);

      // 创建导出目录
      const exportDir = './uploads/exports';
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      const timestamp = Date.now();
      let filePath: string;
      let fileName: string;

      if (exportTable.format === ExportFormat.CSV) {
        fileName = `${exportTable.name}-${timestamp}.csv`;
        filePath = path.join(exportDir, fileName);
        await this.generateCSV(exportTable, filePath);
      } else if (exportTable.format === ExportFormat.EXCEL) {
        fileName = `${exportTable.name}-${timestamp}.xlsx`;
        filePath = path.join(exportDir, fileName);
        await this.generateExcel(exportTable, filePath);
      } else if (exportTable.format === ExportFormat.JSON) {
        fileName = `${exportTable.name}-${timestamp}.json`;
        filePath = path.join(exportDir, fileName);
        await this.generateJSON(exportTable, filePath);
      } else {
        throw new Error('Unsupported export format');
      }

      // 获取文件大小
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      // 更新导出表信息
      exportTable.filePath = filePath;
      exportTable.fileName = fileName;
      exportTable.fileSize = fileSize;
      exportTable.status = ExportStatus.COMPLETED;
      await this.exportTableRepository.save(exportTable);
    } catch (error) {
      exportTable.status = ExportStatus.FAILED;
      await this.exportTableRepository.save(exportTable);
      throw error;
    }
  }

  /**
   * 生成 CSV 文件
   */
  private async generateCSV(exportTable: ExportTable, filePath: string): Promise<void> {
    const columns = exportTable.schema.columns.map((col) => col.name);
    const header = columns.join(',');
    
    const rows = exportTable.data.map((row) => {
      return columns.map((col) => {
        const value = row[col];
        // 处理包含逗号或引号的值
        if (value === null || value === undefined) return '';
        const strValue = String(value);
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      }).join(',');
    });

    const csv = [header, ...rows].join('\n');
    fs.writeFileSync(filePath, csv, 'utf-8');
  }

  /**
   * 生成 Excel 文件
   */
  private async generateExcel(exportTable: ExportTable, filePath: string): Promise<void> {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportTable.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, filePath);
  }

  /**
   * 生成 JSON 文件
   */
  private async generateJSON(exportTable: ExportTable, filePath: string): Promise<void> {
    const jsonData = {
      name: exportTable.name,
      schema: exportTable.schema,
      rowCount: exportTable.rowCount,
      data: exportTable.data,
      createdAt: exportTable.createdAt,
    };
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');
  }

  /**
   * 获取所有导出表(可按项目过滤)
   */
  async findAll(ownerId: string, projectId?: string): Promise<ExportTable[]> {
    const where: any = { ownerId, isActive: true };
    if (projectId) {
      where.projectId = projectId;
    }
    return this.exportTableRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取单个导出表
   */
  async findOne(id: string): Promise<ExportTable> {
    const exportTable = await this.exportTableRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!exportTable) {
      throw new NotFoundException('Export table not found');
    }
    return exportTable;
  }

  /**
   * 更新导出表
   */
  async update(id: string, dto: UpdateExportTableDto, ownerId: string): Promise<ExportTable> {
    const exportTable = await this.findOne(id);
    if (exportTable.ownerId !== ownerId) {
      throw new BadRequestException('You do not have permission to update this export table');
    }

    Object.assign(exportTable, dto);
    return this.exportTableRepository.save(exportTable);
  }

  /**
   * 删除导出表(软删除)
   */
  async remove(id: string, ownerId: string): Promise<void> {
    const exportTable = await this.findOne(id);
    if (exportTable.ownerId !== ownerId) {
      throw new BadRequestException('You do not have permission to delete this export table');
    }

    exportTable.isActive = false;
    await this.exportTableRepository.save(exportTable);
  }

  /**
   * 下载导出文件
   */
  async downloadFile(id: string, ownerId: string): Promise<{ filePath: string; fileName: string }> {
    const exportTable = await this.findOne(id);
    
    if (exportTable.ownerId !== ownerId) {
      throw new BadRequestException('You do not have permission to download this file');
    }

    if (exportTable.status !== ExportStatus.COMPLETED) {
      throw new BadRequestException('Export file is not ready yet');
    }

    if (!exportTable.filePath || !fs.existsSync(exportTable.filePath)) {
      throw new NotFoundException('Export file not found');
    }

    return {
      filePath: exportTable.filePath,
      fileName: exportTable.fileName,
    };
  }

  /**
   * 获取导出表预览数据
   */
  async getPreview(id: string, limit: number = 100): Promise<any[]> {
    const exportTable = await this.findOne(id);
    return exportTable.data.slice(0, limit);
  }
}
