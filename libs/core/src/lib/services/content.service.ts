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
    
    // Simple pagination logic
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      model.find().limit(limit).skip(skip).exec(),
      model.countDocuments().exec()
    ]);

    return {
      docs,
      totalDocs: total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(slug: string, id: string) {
    const model = this.getModel(slug);
    const doc = await model.findById(id).exec();
    if (!doc) throw new NotFoundException();
    return doc;
  }

  async create(slug: string, data: any) {
    const model = this.getModel(slug);
    const created = new model(data);
    return created.save();
  }

  async update(slug: string, id: string, data: any) {
    const model = this.getModel(slug);
    const updated = await model.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updated) throw new NotFoundException();
    return updated;
  }

  async delete(slug: string, id: string) {
    const model = this.getModel(slug);
    const deleted = await model.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException();
    return { id: deleted._id, status: 'deleted' };
  }
}