import { VertexPlugin } from '@vertex/common';
import { PluginDbMongoModule } from './plugin-db-mongo.module';

export interface MongoPluginOptions {
  uri: string;
}

export function DatabaseMongoPlugin(options: MongoPluginOptions): VertexPlugin {
  return {
    name: 'mongodb',
    type: 'database',
    module: PluginDbMongoModule.forRoot(options.uri),
    options
  };
}
