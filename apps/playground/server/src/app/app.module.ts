import { Module } from '@nestjs/common';
import { VertexCoreModule } from '@vertex/core';
import { Movie } from './collections/movie.collection';
import { User } from './collections/user.collection';
import { Page } from './collections/page.collection';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // 1. Keep this for Local Development / LocalStorage
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads', 
    }),
    
    VertexCoreModule.forRoot({
      // Make sure you have a local mongo running or use a cloud URI -> Use mongodb atlas for a free cluster :)
      mongoUri: process.env.MONGO_URI,
      collections: [
        Movie,
        User,
        Page
      ],
      // storageAdapter: S3Adapter or GCSAdapter (Future) <--- This is how to swap adapters
    })
  ],
})
export class AppModule {}