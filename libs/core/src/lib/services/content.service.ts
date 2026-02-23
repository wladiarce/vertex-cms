import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SchemaDiscoveryService } from './schema-discovery.service';
import { VersionService } from './version.service';
import { getLocalizedValue } from '../utils/locale.utils';
import { LocaleConfigProvider } from '../providers/locale-config.provider';
import { DocumentStatus } from '@vertex/common';
import { DatabaseRegistryService } from './database-registry.service';

@Injectable()
export class ContentService {
  constructor(
    private readonly dbRegistry: DatabaseRegistryService,
    private readonly discovery: SchemaDiscoveryService,
    private readonly localeConfig: LocaleConfigProvider,
    private readonly versionService: VersionService
  ) {}

  async findAll(slug: string, query: any = {}) {
    const repository = this.dbRegistry.getRepository(slug);
    const config = this.discovery.getCollection(slug);
    
    // Extract locale from query
    const locale = query.locale || this.localeConfig.getDefaultLocale();
    
    // Simple pagination logic
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    
    // Add draft filtering if collection has drafts enabled (default: true)
    const draftsEnabled = config?.drafts !== false;
    if (draftsEnabled) {
      const status = query.status || DocumentStatus.Published; // Default to published only
      if (status !== 'all') {
        filter.status = status;
      }
    }
    
    // Quick Fix: Allow direct matching for top-level fields
    const { page: _p, limit: _l, locale: _loc, status: _s, populate: _pop, ...rest } = query;
    Object.assign(filter, rest);

    // Build populate config
    let populate: string[] = [];
    if (query.populate) {
       // For now keep using the built-in path builder, but return flat array of paths
       populate = this.buildPopulatePaths(query.populate, slug);
    }

    const { docs, total } = await repository.findAll({
      filter,
      limit,
      skip,
      populate
    });

    // Transform localized fields
    let processedDocs = docs.map((doc: any) => this.transformLocalizedFields(doc, locale, slug));

    if (config?.hooks?.afterRead) {
      // Run hook for every document in parallel
      processedDocs = await Promise.all(
        processedDocs.map((doc: any) => config.hooks!.afterRead!({ doc }))
      );
    }

    // EXECUTE HOOK: afterRead
    return {
      docs: processedDocs,
      totalDocs: total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(slug: string, id: string, locale?: string, raw: boolean = false, populate?: string) {
    const repository = this.dbRegistry.getRepository(slug);
    const config = this.discovery.getCollection(slug);

    let populatePaths: string[] = [];
    if (populate) {
      populatePaths = this.buildPopulatePaths(populate, slug);
    }
    
    const doc = await repository.findOne(id, { populate: populatePaths });
    
    if (!doc) throw new NotFoundException();

    let result = doc;
    
    // Only transform localized fields if NOT requesting raw data (admin needs raw)
    if (!raw) {
      const requestedLocale = locale || this.localeConfig.getDefaultLocale();
      result = this.transformLocalizedFields(result, requestedLocale, slug);
    }
    
    if(config?.hooks?.afterRead) {
      return config.hooks.afterRead({ doc: result });
    }
    
    return result;
  }

  async create(slug: string, data: any) {
    const repository = this.dbRegistry.getRepository(slug);
    const config = this.discovery.getCollection(slug);

    // Sanitize before creating
    let cleanData = this.removeEmptyStrings(data);
    
    // EXECUTE HOOK: beforeChange
    if (config?.hooks?.beforeChange) {
      cleanData = await config.hooks.beforeChange({ data: cleanData, operation: 'create' });
    }

    return repository.create(cleanData);
  }

  async update(slug: string, id: string, data: any) {
    const repository = this.dbRegistry.getRepository(slug);
    const config = this.discovery.getCollection(slug);

    // Sanitize before updating
    let cleanData = this.removeEmptyStrings(data);
    
    // EXECUTE HOOK: beforeChange
    if (config?.hooks?.beforeChange) {
      cleanData = await config.hooks.beforeChange({ data: cleanData, operation: 'update' });
    }

    // Get the current document to check if it's published
    const currentDoc = await repository.findOne(id);
    if (!currentDoc) throw new NotFoundException();

    const updated = await repository.update(id, cleanData);
    if (!updated) throw new NotFoundException();
    
    // Create version if:
    // 1. Collection has drafts enabled (default: true)
    // 2. Document is currently published
    // 3. Document will remain published after update
    const draftsEnabled = config?.drafts !== false;
    if (draftsEnabled && currentDoc.status === DocumentStatus.Published && updated.status === DocumentStatus.Published) {
      await this.versionService.createVersion(slug, id, updated, currentDoc.createdBy);
    }
    
    return updated;
  }

  async delete(slug: string, id: string) {
    const repository = this.dbRegistry.getRepository(slug);
    const deleted = await repository.delete(id);
    if (!deleted) throw new NotFoundException();
    return { id: deleted._id || deleted.id, status: 'deleted' };
  }

  /**
   * Transform localized fields in a document based on requested locale
   * For localized fields, replaces the locale object with a single value
   */
  private transformLocalizedFields(doc: any, locale: string, collectionSlug: string): any {
    const config = this.discovery.getCollection(collectionSlug);
    if (!config) return doc;

    const transformed = { ...doc };

    // Iterate through collection fields to find localized ones
    config.fields.forEach(field => {
      if (field.localized && transformed[field.name] !== undefined) {
        // Apply locale transformation with fallback
        transformed[field.name] = getLocalizedValue(
          transformed[field.name],
          locale,
          this.localeConfig.getDefaultLocale()
        );
      }
    });

    return transformed;
  }

  private removeEmptyStrings(data: any) {
    const output = { ...data };
    Object.keys(output).forEach(key => {
      if (output[key] === '') {
        delete output[key];
      }
    });
    return output;
  }

  /**
   * Publish a draft document
   * Creates a version when publishing
   */
  async publish(slug: string, id: string) {
    const repository = this.dbRegistry.getRepository(slug);
    const config = this.discovery.getCollection(slug);
    
    const draftsEnabled = config?.drafts !== false;
    if (!draftsEnabled) {
      throw new BadRequestException('Collection does not support drafts');
    }

    const updated = await repository.update(
      id,
      { status: DocumentStatus.Published, publishedAt: new Date() }
    );
    
    if (!updated) throw new NotFoundException();
    
    // Create version on publish
    await this.versionService.createVersion(slug, id, updated, updated.createdBy);
    
    return updated;
  }

  /**
   * Unpublish a document (change status to draft)
   */
  async unpublish(slug: string, id: string) {
    const repository = this.dbRegistry.getRepository(slug);
    const config = this.discovery.getCollection(slug);
    
    const draftsEnabled = config?.drafts !== false;
    if (!draftsEnabled) {
      throw new BadRequestException('Collection does not support drafts');
    }

    const updated = await repository.update(
      id,
      { status: DocumentStatus.Draft }
    );
    
    if (!updated) throw new NotFoundException();
    return updated;
  }

  /**
   * Get all versions for a document
   */
  async getVersions(slug: string, id: string) {
    return this.versionService.getVersions(slug, id);
  }

  /**
   * Restore a document to a previous version
   */
  async restoreVersion(slug: string, id: string, versionId: string) {
    const restoredData = await this.versionService.restoreVersion(slug, versionId);
    // Update the document with restored data
    return this.update(slug, id, restoredData);
  }

  /**
   * Build populate paths from query parameter
   * Supports nested population with depth limit and circular reference detection
   * @param populateParam Comma-separated field names (e.g., "author,categories,author.company")
   * @param collectionSlug Current collection slug for field validation
   * @param depth Current depth level (for recursion limit)
   * @param visited Set of already visited collection:field pairs (for circular reference detection)
   * @param prefix Current path prefix for nested paths
   */
  private buildPopulatePaths(
    populateParam: string, 
    collectionSlug: string, 
    depth: number = 0,
    visited: Set<string> = new Set(),
    prefix: string = ''
  ): string[] {
    const MAX_DEPTH = 3;
    
    if (depth >= MAX_DEPTH) {
      return [];
    }
    
    const config = this.discovery.getCollection(collectionSlug);
    if (!config) return [];
    
    const fields = populateParam.split(',').map(f => f.trim());
    const populatePaths: string[] = [];
    
    for (const field of fields) {
      // Check for nested population (e.g., "author.company")
      const parts = field.split('.');
      const firstField = parts[0];
      
      // Find the field in collection metadata
      const fieldMeta = config.fields.find(f => f.name === firstField && f.type === 'relationship');
      if (!fieldMeta || !fieldMeta.relationTo) continue;
      
      // Check for circular references
      const visitKey = `${collectionSlug}:${firstField}`;
      if (visited.has(visitKey)) continue;
      
      const newVisited = new Set(visited);
      newVisited.add(visitKey);
      
      const currentPath = prefix ? `${prefix}.${firstField}` : firstField;
      populatePaths.push(currentPath);
      
      // Handle nested population
      if (parts.length > 1 && depth + 1 < MAX_DEPTH) {
        const nestedFields = parts.slice(1).join('.');
        const nestedPaths = this.buildPopulatePaths(
          nestedFields, 
          fieldMeta.relationTo, 
          depth + 1,
          newVisited,
          currentPath
        );
        populatePaths.push(...nestedPaths);
      }
    }
    
    return [...new Set(populatePaths)]; // Return unique paths
  }

  /**
   * Search documents for relationship field autocomplete
   * Searches in title, name, or specified fields
   */
  async searchForRelationship(
    slug: string,
    searchTerm: string,
    limit: number = 10,
    searchFields?: string[]
  ): Promise<any[]> {
    const repository = this.dbRegistry.getRepository(slug);
    const config = this.discovery.getCollection(slug);
    
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }
    
    // Determine which fields to search
    const fieldsToSearch = searchFields || ['title', 'name'];
    
    const filter: any = {};
    
    // Add published status filter if drafts are enabled
    const draftsEnabled = config?.drafts !== false;
    if (draftsEnabled) {
      filter.status = DocumentStatus.Published;
    }
    
    return repository.search(searchTerm, {
      fields: fieldsToSearch,
      filter,
      limit
    });
  }
}
