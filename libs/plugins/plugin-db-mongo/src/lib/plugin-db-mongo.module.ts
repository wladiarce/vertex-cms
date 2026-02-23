import { Module, DynamicModule, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseDatabaseAdapter } from './mongoose-database.adapter';
import { MongooseSchemaFactory } from './mongoose-schema.factory';
import { VERTEX_DB_ADAPTER } from '@vertex/common';

@Global()
@Module({
  providers: [
    MongooseSchemaFactory,
    {
      provide: VERTEX_DB_ADAPTER,
      useClass: MongooseDatabaseAdapter,
    },
  ],
  exports: [
    VERTEX_DB_ADAPTER,
  ],
})
export class PluginDbMongoModule {
  static forRoot(uri: string): DynamicModule {
    return {
      module: PluginDbMongoModule,
      imports: [
        MongooseModule.forRoot(uri),
      ],
    };
  }
}
