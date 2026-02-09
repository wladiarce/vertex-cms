import { Module, Global, DynamicModule } from '@nestjs/common';
import { StorageAdapter } from '@vertex/common';
import { LocalStorageAdapter, StorageLocalOptions } from './local-storage.adapter';

@Global()
@Module({})
export class VertexPluginStorageLocalModule {
  static register(options: StorageLocalOptions = {}): DynamicModule {
    return {
      module: VertexPluginStorageLocalModule,
      providers: [
        {
          provide: 'STORAGE_LOCAL_OPTIONS',
          useValue: options,
        },
        {
          provide: StorageAdapter,
          useClass: LocalStorageAdapter,
        },
      ],
      exports: [StorageAdapter],
    };
  }
}
