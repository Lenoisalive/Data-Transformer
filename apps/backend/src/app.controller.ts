import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      name: 'Data Transformer API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        minio: 'connected',
      },
    };
  }

  @Get('api')
  getApi() {
    return {
      message: 'Data Transformer API',
      version: '1.0.0',
      endpoints: [
        { path: '/', method: 'GET', description: 'API info' },
        { path: '/health', method: 'GET', description: 'Health check' },
        { path: '/api', method: 'GET', description: 'API documentation' },
      ],
    };
  }
}
