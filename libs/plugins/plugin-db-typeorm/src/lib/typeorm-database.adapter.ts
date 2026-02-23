import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository, EntitySchema } from 'typeorm';
import { DatabaseAdapter, VertexRepository, FindAllQuery } from '@vertex/common';
import { TypeORMEntityFactory } from './typeorm-entity.factory';

class TypeORMVertexRepository implements VertexRepository {
  private repository: Repository<any>;

  constructor(private schema: EntitySchema, private manager: EntityManager) {
    this.repository = this.manager.getRepository(this.schema);
  }

  async findAll(query: FindAllQuery): Promise<{ docs: any[]; total: number }> {
    const { filter = {}, limit = 10, skip = 0, sort = { createdAt: 'DESC' }, populate = [] } = query;
    
    // TypeORM find options
    const [docs, total] = await this.repository.findAndCount({
      where: filter,
      take: limit,
      skip: skip,
      order: sort,
      relations: populate, // Simplified: assumes relationship names match
    });

    return { docs, total };
  }

  async findOne(id: string, options?: { populate?: string[] }): Promise<any> {
    const doc = await this.repository.findOne({
      where: { id } as any,
      relations: options?.populate
    });
    return doc || null;
  }

  async create(data: any): Promise<any> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, data: any): Promise<any> {
    await this.repository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string): Promise<any> {
    const result = await this.repository.delete(id);
    return result;
  }

  async count(filter: any): Promise<number> {
    return this.repository.count({ where: filter });
  }

  async search(searchTerm: string, options: { fields: string[]; filter?: any; limit?: number }): Promise<any[]> {
    const { fields, filter = {}, limit = 10 } = options;
    
    // Using QueryBuilder for complex search in SQL
    const qb = this.repository.createQueryBuilder('entity');
    
    qb.where(filter);
    
    fields.forEach((field, index) => {
      const condition = `entity.${field} LIKE :term`;
      if (index === 0) {
        qb.andWhere(condition, { term: `%${searchTerm}%` });
      } else {
        qb.orWhere(condition, { term: `%${searchTerm}%` });
      }
    });

    return qb.limit(limit).getMany();
  }
}

@Injectable()
export class TypeORMDatabaseAdapter implements DatabaseAdapter {
  readonly name = 'typeorm';
  private entities: EntitySchema[] = [];
  private schemaMap: Map<string, EntitySchema> = new Map();

  constructor(
    private readonly dataSource: DataSource,
    private readonly entityFactory: TypeORMEntityFactory
  ) {}

  async init(): Promise<void> {
    // DataSource initialization is handled by TypeOrmModule
  }

  async registerCollection(metadata: any): Promise<void> {
    const entity = this.entityFactory.createEntity(metadata);
    this.entities.push(entity);
    this.schemaMap.set(metadata.slug, entity);
  }

  async onDiscoveryComplete(): Promise<void> {
    if (this.entities.length > 0 && this.dataSource.isInitialized) {
      // Re-initialize DataSource with the new entities discovered
      // This is necessary in TypeORM 0.3+ for dynamic schemas to be registered and synchronized
      const currentOptions = this.dataSource.options;
      
      // Update entities in options
      (currentOptions as any).entities = [
        ...((currentOptions.entities as any) || []),
        ...this.entities
      ];

      await this.dataSource.destroy();
      await this.dataSource.initialize();
    }
  }

  getRepository(collectionSlug: string): VertexRepository {
    const schema = this.schemaMap.get(collectionSlug);
    if (!schema) {
      throw new Error(`No schema registered for collection: ${collectionSlug}`);
    }
    return new TypeORMVertexRepository(schema, this.dataSource.manager);
  }
}
