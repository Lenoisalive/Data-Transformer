import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportService } from './export.service';
import { CreateExportTableDto } from './dto/create-export-table.dto';
import { UpdateExportTableDto } from './dto/update-export-table.dto';
import { createReadStream } from 'fs';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * 创建导出表
   */
  @Post()
  async create(@Body() createDto: CreateExportTableDto, @Request() req) {
    const exportTable = await this.exportService.create(createDto, req.user.id);
    return {
      success: true,
      data: exportTable,
      message: 'Export table created successfully',
    };
  }

  /**
   * 获取所有导出表
   */
  @Get()
  async findAll(@Request() req, @Query('projectId') projectId?: string) {
    const exportTables = await this.exportService.findAll(req.user.id, projectId);
    return {
      success: true,
      data: exportTables,
    };
  }

  /**
   * 获取单个导出表详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const exportTable = await this.exportService.findOne(id);
    return {
      success: true,
      data: exportTable,
    };
  }

  /**
   * 获取导出表预览数据
   */
  @Get(':id/preview')
  async getPreview(@Param('id') id: string, @Query('limit') limit?: number) {
    const previewData = await this.exportService.getPreview(id, limit ? Number(limit) : 100);
    return {
      success: true,
      data: previewData,
    };
  }

  /**
   * 下载导出文件
   */
  @Get(':id/download')
  async download(@Param('id') id: string, @Request() req, @Res({ passthrough: true }) res: Response) {
    const { filePath, fileName } = await this.exportService.downloadFile(id, req.user.id);
    
    const file = createReadStream(filePath);
    
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
    });

    return new StreamableFile(file);
  }

  /**
   * 更新导出表
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateExportTableDto,
    @Request() req,
  ) {
    const exportTable = await this.exportService.update(id, updateDto, req.user.id);
    return {
      success: true,
      data: exportTable,
      message: 'Export table updated successfully',
    };
  }

  /**
   * 删除导出表
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.exportService.remove(id, req.user.id);
    return {
      success: true,
      message: 'Export table deleted successfully',
    };
  }
}
