import { VertexPlugin } from '@vertex/common';
import { VertexPluginStorageGcsModule } from './vertex-plugin-storage-gcs.module';
import { GcsStorageOptions } from './gcs-storage.adapter';

/**
 * Storage GCS Plugin for Vertex CMS.
 * Integrates Google Cloud Storage as a storage provider.
 */
export const StorageGcsPlugin = (options: GcsStorageOptions): VertexPlugin => ({
  name: 'storage-gcs',
  type: 'storage',
  module: VertexPluginStorageGcsModule.register(options),
});
