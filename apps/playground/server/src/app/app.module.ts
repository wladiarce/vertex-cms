import { Module } from '@nestjs/common';
import { VertexCoreModule } from '@vertex/core';
import { Movie } from './collections/movie.collection';

@Module({
  imports: [
    VertexCoreModule.forRoot({
      // Make sure you have a local mongo running or use a cloud URI
      mongoUri: 'mongodb+srv://vertex-cms:RdaSNy9ui8bdRAeb@test-cluster.187wcci.mongodb.net/vertex-cms?appName=test-cluster',
      collections: [Movie]
    })
  ],
})
export class AppModule {}