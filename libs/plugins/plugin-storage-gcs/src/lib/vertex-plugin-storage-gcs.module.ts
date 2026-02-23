import { Module, DynamicModule, Global } from '@nestjs/common';
import { StorageAdapter } from '@vertex-cms/common';
import { GcsStorageAdapter, GcsStorageOptions } from './gcs-storage.adapter';

@Global()
@Module({})
export class VertexPluginStorageGcsModule {
  static register(options: GcsStorageOptions): DynamicModule {
    return {
      module: VertexPluginStorageGcsModule,
      providers: [
        {
          provide: 'GCS_STORAGE_OPTIONS',
          useValue: options,
        },
        {
          provide: StorageAdapter,
          useClass: GcsStorageAdapter,
        },
      ],
      exports: [StorageAdapter],
    };
  }
}
