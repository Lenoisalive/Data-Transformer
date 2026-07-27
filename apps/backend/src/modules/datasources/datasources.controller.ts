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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DatasourcesService } from './datasources.service';
import { DatabaseImportService } from './database-import.service';
import { CreateDataSourceDto } from './dto/create-datasource.dto';
import { UpdateDataSourceDto } from './dto/update-datasource.dto';
import { CreateDatabaseConnectionDto, TestConnectionDto, ImportFromDatabaseDto } from './dto/database-connection.dto';
import { DataSourceType } from './entities/datasource.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

// 配置文件上传存储
const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/datasources';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Only CSV and Excel files are allowed'), false);
  }
};

@Controller('datasources')
@UseGuards(JwtAuthGuard)
export class DatasourcesController {
  constructor(
    private readonly datasourcesService: DatasourcesService,
    private readonly databaseImportService: DatabaseImportService,
  ) {}

  /**
   * 创建数据源并上传文件
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB 限制
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @Body('type') type: string,
    @Body('description') description: string,
    @Body('projectId') projectId: string,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // 创建数据源记录
    const datasource = await this.datasourcesService.create(
      {
        name: name || file.originalname,
        type: type as any,
        description,
        projectId,
      },
      req.user.id,
    );

    // 处理文件并解析 schema
    const processedDatasource = await this.datasourcesService.processFile(
      datasource.id,
      file,
      file.path,
    );

    return {
      success: true,
      data: processedDatasource,
      message: 'File uploaded and processed successfully',
    };
  }

  /**
   * 获取所有数据源
   */
  @Get()
  async findAll(@Request() req, @Query('projectId') projectId?: string) {
    const datasources = await this.datasourcesService.findAll(req.user.id, projectId);
    return {
      success: true,
      data: datasources,
    };
  }

  /**
   * 获取单个数据源详情
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const datasource = await this.datasourcesService.findOne(id);
    return {
      success: true,
      data: datasource,
    };
  }

  /**
   * 获取数据源预览数据
   */
  @Get(':id/preview')
  async getPreview(@Param('id') id: string, @Query('limit') limit?: number) {
    const previewData = await this.datasourcesService.getPreview(id, limit ? Number(limit) : 100);
    return {
      success: true,
      data: previewData,
    };
  }

  /**
   * 更新数据源
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDataSourceDto,
    @Request() req,
  ) {
    const datasource = await this.datasourcesService.update(id, updateDto, req.user.id);
    return {
      success: true,
      data: datasource,
      message: 'Data source updated successfully',
    };
  }

  /**
   * 删除数据源
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.datasourcesService.remove(id, req.user.id);
    return {
      success: true,
      message: 'Data source deleted successfully',
    };
  }

  // ==================== 数据库导入功能 ====================

  /**
   * 测试数据库连接
   */
  @Post('database/test-connection')
  async testConnection(@Body() dto: TestConnectionDto) {
    const result = await this.databaseImportService.testConnection(dto);
    return {
      success: result.success,
      message: result.message,
    };
  }

  /**
   * 创建数据库连接
   */
  @Post('database/connections')
  async createConnection(@Body() dto: CreateDatabaseConnectionDto, @Request() req) {
    const connection = await this.databaseImportService.createConnection(dto, req.user.id);
    return {
      success: true,
      data: connection,
      message: 'Database connection created successfully',
    };
  }

  /**
   * 获取所有数据库连接
   */
  @Get('database/connections')
  async getAllConnections(@Request() req) {
    const connections = await this.databaseImportService.getAllConnections(req.user.id);
    return {
      success: true,
      data: connections,
    };
  }

  /**
   * 获取单个数据库连接
   */
  @Get('database/connections/:id')
  async getConnection(@Param('id') id: string, @Request() req) {
    const connection = await this.databaseImportService.getConnection(id, req.user.id);
    return {
      success: true,
      data: connection,
    };
  }

  /**
   * 删除数据库连接
   */
  @Delete('database/connections/:id')
  async deleteConnection(@Param('id') id: string, @Request() req) {
    await this.databaseImportService.deleteConnection(id, req.user.id);
    return {
      success: true,
      message: 'Database connection deleted successfully',
    };
  }

  /**
   * 获取数据库中的所有表
   */
  @Get('database/connections/:id/tables')
  async getTables(@Param('id') id: string, @Request() req) {
    const tables = await this.databaseImportService.getTables(id, req.user.id);
    return {
      success: true,
      data: tables,
    };
  }

  /**
   * 预览数据库表数据
   */
  @Get('database/connections/:id/tables/:tableName/preview')
  async previewTable(
    @Param('id') id: string,
    @Param('tableName') tableName: string,
    @Query('limit') limit: number,
    @Request() req,
  ) {
    const data = await this.databaseImportService.previewTableData(
      id,
      tableName,
      req.user.id,
      limit || 10,
    );
    return {
      success: true,
      data,
    };
  }

  /**
   * 从数据库导入数据
   */
  @Post('database/import')
  async importFromDatabase(@Body() dto: ImportFromDatabaseDto, @Request() req) {
    const { data, schema } = await this.databaseImportService.importFromDatabase(dto, req.user.id);

    const datasource = await this.datasourcesService.create(
      {
        name: dto.importTableName,
        type: DataSourceType.DATABASE,
        description: dto.description || `Imported from database table: ${dto.tableName}`,
        projectId: null,
      },
      req.user.id,
    );

    await this.datasourcesService.saveImportedData(datasource.id, {
      schema,
      data,
      rowCount: data.length,
    });

    return {
      success: true,
      data: datasource,
      message: 'Data imported from database successfully',
    };
  }
}
