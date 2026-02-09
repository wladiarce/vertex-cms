import { DynamicModule, Type } from '@nestjs/common';

export type VertexPluginType = 'storage' | 'auth' | 'database' | 'blocks' | 'custom';

/**
 * Interface representing a Vertex Plugin.
 * Plugins are used to extend the core functionality of Vertex CMS.
 */
export interface VertexPlugin {
  /**
   * Unique name of the plugin
   */
  name: string;

  /**
   * Type of the plugin. Determines how it's integrated into the core.
   */
  type: VertexPluginType;

  /**
   * The NestJS module that implements the plugin functionality.
   * It can be a simple Class or a DynamicModule (e.g., calling .register())
   */
  module: Type<any> | DynamicModule;

  /**
   * Optional configuration for the plugin.
   */
  options?: any;
}
