import { Module, DynamicModule, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeORMDatabaseAdapter } from './typeorm-database.adapter';
import { TypeORMEntityFactory } from './typeorm-entity.factory';
import { VERTEX_DB_ADAPTER } from '@vertex/common';

@Global()
@Module({
  providers: [
    TypeORMEntityFactory,
    {
      provide: VERTEX_DB_ADAPTER,
      useClass: TypeORMDatabaseAdapter,
    },
  ],
  exports: [
    VERTEX_DB_ADAPTER,
  ],
})
export class PluginDbTypeormModule {
  static forRoot(options: any): DynamicModule {
    return {
      module: PluginDbTypeormModule,
      imports: [
        TypeOrmModule.forRoot({
          ...options,
          autoLoadEntities: true,
          synchronize: true, // For development convenience
        }),
      ],
    };
  }
}
