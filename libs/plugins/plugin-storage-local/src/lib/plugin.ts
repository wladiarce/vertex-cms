import { VertexPlugin } from '@vertex/common';
import { VertexPluginStorageLocalModule } from './vertex-plugin-storage-local.module';
import { StorageLocalOptions } from './local-storage.adapter';

/**
 * Storage Local Plugin for Vertex CMS.
 * Decouples local filesystem storage from the core.
 */
export const StorageLocalPlugin = (options: StorageLocalOptions = {}): VertexPlugin => ({
  name: 'storage-local',
  type: 'storage',
  module: VertexPluginStorageLocalModule.register(options),
});
