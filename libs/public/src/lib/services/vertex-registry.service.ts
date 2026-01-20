import { Injectable, Type } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VertexRegistryService {
  private components = new Map<string, Type<any>>();

  /**
   * Register a component for a specific block type
   * @param blockSlug The slug defined in the backend @Block({ slug: '...' })
   * @param component The Angular Component class
   */
  register(blockSlug: string, component: Type<any>) {
    this.components.set(blockSlug, component);
  }

  get(blockSlug: string): Type<any> | undefined {
    return this.components.get(blockSlug);
  }
}