import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { UserRole } from './modules/users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Check if any users exist
    const userCount = await usersService.count();

    if (userCount === 0) {
      console.log('No users found. Creating default users...');

      // Create default admin user
      const admin = await usersService.create({
        username: 'admin',
        email: 'admin@datatransformer.com',
        password: 'admin123',
        role: UserRole.ADMIN,
      });
      console.log('✅ Admin user created:', admin.email);

      // Create default engineer user
      const engineer = await usersService.create({
        username: 'engineer',
        email: 'engineer@datatransformer.com',
        password: 'engineer123',
        role: UserRole.ENGINEER,
      });
      console.log('✅ Engineer user created:', engineer.email);

      // Create default analyst user
      const analyst = await usersService.create({
        username: 'analyst',
        email: 'analyst@datatransformer.com',
        password: 'analyst123',
        role: UserRole.ANALYST,
      });
      console.log('✅ Analyst user created:', analyst.email);

      console.log('\n📋 Default User Credentials:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Admin:    admin@datatransformer.com / admin123');
      console.log('Engineer: engineer@datatransformer.com / engineer123');
      console.log('Analyst:  analyst@datatransformer.com / analyst123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log(`Found ${userCount} existing users. Skipping seed.`);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
