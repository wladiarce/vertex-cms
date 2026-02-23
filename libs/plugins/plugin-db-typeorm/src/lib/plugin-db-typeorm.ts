import { VertexPlugin } from '@vertex/common';
import { PluginDbTypeormModule } from './plugin-db-typeorm.module';

export interface TypeOrmPluginOptions {
  type: 'postgres' | 'mysql' | 'sqlite' | 'mariadb';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database: string;
}

export function DatabaseTypeORMPlugin(options: TypeOrmPluginOptions): VertexPlugin {
  return {
    name: 'typeorm',
    type: 'database',
    module: PluginDbTypeormModule.forRoot(options),
    options
  };
}
