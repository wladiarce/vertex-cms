import { Injectable, Logger, Optional } from '@nestjs/common';
import { DatabaseAdapter, VertexRepository } from '@vertex-cms/common';

@Injectable()
export class DatabaseRegistryService {
  private readonly logger = new Logger(DatabaseRegistryService.name);
  private adapter: DatabaseAdapter | null = null;

  constructor(@Optional() adapter?: DatabaseAdapter) {
    if (adapter) {
      this.adapter = adapter;
      this.logger.log(`Database adapter registered via constructor: ${adapter.name}`);
    }
  }

  async registerAdapter(adapter: DatabaseAdapter): Promise<void> {
    this.adapter = adapter;
    await adapter.init();
    this.logger.log(`Database adapter registered and initialized: ${adapter.name}`);
  }

  getAdapter(): DatabaseAdapter {
    if (!this.adapter) {
      throw new Error('No database adapter registered. Please ensure a database plugin is configured in VertexCoreModule.');
    }
    return this.adapter;
  }

  getRepository(collectionSlug: string): VertexRepository {
    return this.getAdapter().getRepository(collectionSlug);
  }
}
