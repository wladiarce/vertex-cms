import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { DatabaseAdapter, VertexRepository, FindAllQuery } from '@vertex-cms/common';
import { MongooseSchemaFactory } from './mongoose-schema.factory';

class MongooseRepository implements VertexRepository {
  constructor(private model: Model<any>) {}

  async findAll(query: FindAllQuery): Promise<{ docs: any[]; total: number }> {
    const { filter = {}, limit = 10, skip = 0, sort = { createdAt: -1 }, populate = [] } = query;
    
    let mQuery = this.model.find(filter).sort(sort).limit(limit).skip(skip);
    
    populate.forEach(p => {
      mQuery = mQuery.populate(p);
    });

    // We use lean for performance, but lean objects don't have virtuals/transforms
    const [docs, total] = await Promise.all([
      mQuery.lean().exec(),
      this.model.countDocuments(filter).exec()
    ]);

    return { 
      docs: docs.map(d => ({ ...d, id: d._id.toString() })), 
      total 
    };
  }

  async findOne(id: string, options?: { populate?: string[] }): Promise<any> {
    let mQuery = this.model.findById(id);
    
    if (options?.populate) {
      options.populate.forEach(p => {
        mQuery = mQuery.populate(p);
      });
    }

    const doc = await mQuery.exec();
    // doc.toObject() now handles _id -> id mapping automatically via Schema settings
    return doc ? doc.toObject() : null;
  }

  async create(data: any): Promise<any> {
    const created = new this.model(data);
    const saved = await created.save();
    return saved.toObject();
  }

  async update(id: string, data: any): Promise<any> {
    const updated = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    return updated ? updated.toObject() : null;
  }

  async delete(id: string): Promise<any> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async count(filter: any): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async search(searchTerm: string, options: { fields: string[]; filter?: any; limit?: number }): Promise<any[]> {
    const { fields, filter = {}, limit = 10 } = options;
    
    const searchFilter: any = {
      ...filter,
      $or: fields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' }
      }))
    };

    const docs = await this.model
      .find(searchFilter)
      .limit(limit)
      .select(fields.join(' ') + ' _id')
      .lean()
      .exec();

    return docs.map(d => ({ ...d, id: d._id.toString() }));
  }
}

@Injectable()
export class MongooseDatabaseAdapter implements DatabaseAdapter {
  readonly name = 'mongoose';

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly schemaFactory: MongooseSchemaFactory
  ) {}

  async init(): Promise<void> {
    // No-op for now, connection is handled by MongooseModule
  }

  async registerCollection(metadata: any): Promise<void> {
    if (!this.connection.models[metadata.slug]) {
      const schema = this.schemaFactory.createSchema(metadata);
      this.connection.model(metadata.slug, schema);
    }
  }

  getRepository(collectionSlug: string): VertexRepository {
    const model = this.connection.model(collectionSlug);
    return new MongooseRepository(model);
  }
}
