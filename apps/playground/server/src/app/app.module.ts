import { Module } from '@nestjs/common';
import { VertexCoreModule } from '@vertex/core';
import { Movie } from './collections/movie.collection';
import { User } from './collections/user.collection';
import { Page } from './collections/page.collection';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // Serve Uploads (Volume Mount)
    ServeStaticModule.forRoot({
      rootPath: process.env.UPLOAD_PATH || join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    VertexCoreModule.forRoot({
      // Make sure you have a local mongo running (as included in the docker-compose)or use a cloud URI -> Use mongodb atlas for a free cluster :)
      mongoUri: process.env.MONGO_URI,
      entities: [
        Movie,
        User,
        Page
      ],
      // Configure locales for your application
      locales: {
        default: 'en',
        supported: ['en', 'es', 'pt'],
        names: {
          en: 'English',
          es: 'Español',
          pt: 'Português'
        }
      }
      // storageAdapter: S3Adapter or GCSAdapter (Future) <--- This is how to swap adapters
    })
  ],
})
export class AppModule {}