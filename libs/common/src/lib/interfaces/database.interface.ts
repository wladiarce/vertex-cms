
export const VERTEX_DB_ADAPTER = 'VERTEX_DB_ADAPTER';

export interface DatabaseAdapter {
  name: string;
  init(): Promise<void>;
  registerCollection(metadata: any): Promise<void>; // Use any for now or import CollectionMetadata if possible
  onDiscoveryComplete?(): Promise<void>;
  getRepository(collectionSlug: string): VertexRepository;
}

export interface FindAllQuery {
  filter?: any;
  limit?: number;
  skip?: number;
  sort?: any;
  populate?: string[]; // Array of paths, e.g. ['author', 'author.company']
}

export interface VertexRepository {
  findAll(query: FindAllQuery): Promise<{ docs: any[]; total: number }>;
  findOne(id: string, options?: { populate?: string[] }): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<any>;
  count(filter: any): Promise<number>;
  search(searchTerm: string, options: { fields: string[]; filter?: any; limit?: number }): Promise<any[]>;
}
