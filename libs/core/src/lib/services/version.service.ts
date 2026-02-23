import { Injectable, NotFoundException } from '@nestjs/common';
import { SchemaDiscoveryService } from './schema-discovery.service';
import { DatabaseRegistryService } from './database-registry.service';

/**
 * Service for managing document versions
 * Creates, retrieves, and manages version history for collections with drafts enabled
 */
@Injectable()
export class VersionService {
  constructor(
    private readonly dbRegistry: DatabaseRegistryService,
    private readonly discovery: SchemaDiscoveryService
  ) {}

  /**
   * Create a new version of a document
   * Only called for published documents when they are updated
   */
  async createVersion(
    collectionSlug: string,
    documentId: string,
    data: any,
    userId = ''
  ): Promise<any> {
    const repository = this.dbRegistry.getRepository('_versions');
    
    // Get current version number
    const { docs: latestDocs } = await repository.findAll({
      filter: { collectionSlug, documentId },
      limit: 1,
      sort: { versionNumber: -1 }
    });
    
    const versionNumber = (latestDocs[0]?.versionNumber || 0) + 1;

    // Create new version with stringified data
    const version = await repository.create({
      collectionSlug,
      documentId,
      data: JSON.stringify(data), // Store as JSON string
      createdBy: userId,
      versionNumber
    });

    // Clean up old versions if limit exceeded
    await this.cleanupOldVersions(collectionSlug, documentId);

    return version;
  }

  /**
   * Get all versions for a specific document
   */
  async getVersions(collectionSlug: string, documentId: string): Promise<any[]> {
    const repository = this.dbRegistry.getRepository('_versions');
    const { docs: versions } = await repository.findAll({
      filter: { collectionSlug, documentId },
      limit: 100, // Reasonable limit for versions
      sort: { versionNumber: -1 }
    });

    // Parse data back to objects for each version
    return versions.map((v: any) => ({
      ...v,
      data: v.data ? JSON.parse(v.data) : null
    }));
  }

  /**
   * Restore a specific version by ID
   */
  async restoreVersion(collectionSlug: string, versionId: string): Promise<any> {
    const repository = this.dbRegistry.getRepository('_versions');
    const version = await repository.findOne(versionId);
    
    if (!version) {
      throw new NotFoundException('Version not found');
    }
    
    return version.data ? JSON.parse(version.data) : null;
  }

  /**
   * Clean up old versions beyond the configured limit
   */
  private async cleanupOldVersions(collectionSlug: string, documentId: string): Promise<void> {
    const config = this.discovery.getCollection(collectionSlug);
    const maxVersions = config?.maxVersions || 5; // Default to 5 versions
    
    const repository = this.dbRegistry.getRepository('_versions');
    const { docs: versions } = await repository.findAll({
      filter: { collectionSlug, documentId },
      limit: 100, // Get all versions to cleanup
      sort: { versionNumber: -1 }
    });

    if (versions.length > maxVersions) {
      const toDelete = versions.slice(maxVersions);
      for (const v of toDelete) {
        await repository.delete(v._id || v.id);
      }
    }
  }
}
