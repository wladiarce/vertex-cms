import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { SchemaDiscoveryService } from './schema-discovery.service';

@Injectable()
export class ContentService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly discovery: SchemaDiscoveryService
  ) {}

  private getModel(slug: string): Model<any> {
    // 1. Check if this collection actually exists in our config
    const config = this.discovery.getCollection(slug);
    if (!config) {
      throw new NotFoundException(`Collection '${slug}' not found`);
    }

    // 2. Retrieve the Mongoose Model by name (we used the slug as the model name earlier)
    return this.connection.model(slug);
  }

  async findAll(slug: string, query: any = {}) {
    const model = this.getModel(slug);
    const config = this.discovery.getCollection(slug); // Get config for hooks
    
    // Simple pagination logic
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      model.find().limit(limit).skip(skip).lean().exec(),
      model.countDocuments().exec()
    ]);

    if (config?.hooks?.afterRead) {
      // Run hook for every document in parallel
      const processedDocs = await Promise.all(
        docs.map(doc => config.hooks!.afterRead!({ doc }))
      );
      return { docs: processedDocs, totalDocs: total, page, totalPages: Math.ceil(total / limit) };
    }

    // EXECUTE HOOK: afterRead
    return {
      docs,
      totalDocs: total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(slug: string, id: string) {
    const model = this.getModel(slug);
    const config = this.discovery.getCollection(slug); // Get config for hooks

    const doc = await model.findById(id).exec();
    
    if(config?.hooks?.afterRead) {
      return config.hooks.afterRead({ doc });
    }
    
    if (!doc) throw new NotFoundException();
    return doc;
  }

  async create(slug: string, data: any) {
    const model = this.getModel(slug);
    const config = this.discovery.getCollection(slug); // Get config for hooks

    // Sanitize before creating
    let cleanData = this.removeEmptyStrings(data);
    
    // EXECUTE HOOK: beforeChange
    if (config?.hooks?.beforeChange) {
      cleanData = await config.hooks.beforeChange({ data: cleanData, operation: 'create' });
    }

    const created = new model(cleanData);
    return created.save();
  }

  async update(slug: string, id: string, data: any) {
    const model = this.getModel(slug);
    const config = this.discovery.getCollection(slug); // Get config for hooks

    // Sanitize before updating
    let cleanData = this.removeEmptyStrings(data);
    
    // EXECUTE HOOK: beforeChange
    if (config?.hooks?.beforeChange) {
      cleanData = await config.hooks.beforeChange({ data: cleanData, operation: 'update' });
    }

    const updated = await model.findByIdAndUpdate(id, cleanData, { new: true }).exec();
    if (!updated) throw new NotFoundException();
    return updated;
  }

  async delete(slug: string, id: string) {
    const model = this.getModel(slug);
    const deleted = await model.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException();
    return { id: deleted._id, status: 'deleted' };
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
}