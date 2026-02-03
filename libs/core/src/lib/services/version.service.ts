import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Document } from 'mongoose';
import { SchemaDiscoveryService } from './schema-discovery.service';

// Interface for Version document
interface VersionDocument extends Document {
  collectionSlug: string;
  documentId: string;
  data: string;
  createdBy: string;
  versionNumber: number;
}

/**
 * Service for managing document versions
 * Creates, retrieves, and manages version history for collections with drafts enabled
 */
@Injectable()
export class VersionService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
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
  ): Promise<VersionDocument> {
    const versionModel = this.connection.model<VersionDocument>('_versions');
    
    // Get current version number
    const latestVersion = await versionModel
      .findOne({ collectionSlug, documentId })
      .sort({ versionNumber: -1 })
      .exec();
    
    const versionNumber = (latestVersion?.versionNumber || 0) + 1;

    // Create new version with stringified data
    const version = new versionModel({
      collectionSlug,
      documentId,
      data: JSON.stringify(data), // Store as JSON string
      createdBy: userId,
      versionNumber
    });

    await version.save();

    // Clean up old versions if limit exceeded
    await this.cleanupOldVersions(collectionSlug, documentId);

    return version;
  }

  /**
   * Get all versions for a specific document
   */
  async getVersions(collectionSlug: string, documentId: string): Promise<any[]> {
    const versionModel = this.connection.model<VersionDocument>('_versions');
    const versions = await versionModel
      .find({ collectionSlug, documentId })
      .sort({ versionNumber: -1 })
      .lean()
      .exec();

    // Parse data back to objects for each version
    return versions.map((v) => ({
      ...v,
      data: JSON.parse(v.data)
    }));
  }

  /**
   * Restore a specific version by ID
   */
  async restoreVersion(collectionSlug: string, versionId: string): Promise<any> {
    const versionModel = this.connection.model<VersionDocument>('_versions');
    const version = await versionModel.findById(versionId).exec();
    
    if (!version) {
      throw new NotFoundException('Version not found');
    }
    
    return JSON.parse(version.data);
  }

  /**
   * Clean up old versions beyond the configured limit
   */
  private async cleanupOldVersions(collectionSlug: string, documentId: string): Promise<void> {
    const config = this.discovery.getCollection(collectionSlug);
    const maxVersions = config?.maxVersions || 5; // Default to 5 versions
    
    const versionModel = this.connection.model<VersionDocument>('_versions');
    const versions = await versionModel
      .find({ collectionSlug, documentId })
      .sort({ versionNumber: -1 })
      .exec();

    if (versions.length > maxVersions) {
      const toDelete = versions.slice(maxVersions);
      await versionModel.deleteMany({
        _id: { $in: toDelete.map(v => v._id) }
      });
    }
  }
}
