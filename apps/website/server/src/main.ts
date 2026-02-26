import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
// import { VertexDiscoveryService, VertexMigrationService } from '@vertex-cms/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Optionally run migrations or discovery logging
  
  // Create users, pages, blogs etc
  console.log('Seed started... This should be moved to a standalone script execution.');
  // we will add proper seeder script in `scripts/seed.ts`
  
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
