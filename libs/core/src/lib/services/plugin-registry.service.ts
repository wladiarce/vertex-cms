import { Injectable, Logger } from '@nestjs/common';
import { VertexPlugin, VertexPluginType } from '@vertex/common';

@Injectable()
export class PluginRegistryService {
  private readonly logger = new Logger(PluginRegistryService.name);
  private plugins: VertexPlugin[] = [];

  constructor() {}

  /**
   * Internal method to set registered plugins during module initialization.
   */
  init(plugins: VertexPlugin[]) {
    this.plugins = plugins;
    this.logger.log(`Plugin Registry initialized with ${plugins.length} plugins`);
    
    plugins.forEach(p => {
        this.logger.debug(`- [${p.type}] ${p.name}`);
    });
  }

  /**
   * Returns all registered plugins.
   */
  getAllPlugins(): VertexPlugin[] {
    return this.plugins;
  }

  /**
   * Returns all registered plugins of a specific type.
   */
  getPluginsByType(type: VertexPluginType): VertexPlugin[] {
    return this.plugins.filter(p => p.type === type);
  }

  /**
   * Returns a plugin by its name.
   */
  getPlugin(name: string): VertexPlugin | undefined {
    return this.plugins.find(p => p.name === name);
  }

  /**
   * Helper to check if a specific capability (plugin type) is active.
   */
  hasCapability(type: VertexPluginType): boolean {
    return this.plugins.some(p => p.type === type);
  }
}
