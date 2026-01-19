import { Module } from '@nestjs/common';
import { VertexCoreModule } from '@vertex/core';
import { Movie } from './collections/movie.collection';

@Module({
  imports: [
    VertexCoreModule.forRoot({
      // Make sure you have a local mongo running or use a cloud URI
      mongoUri: process.env.MONGO_URI,
      collections: [Movie]
    })
  ],
})
export class AppModule {}