import 'reflect-metadata';
import { CollectionOptions } from '../interfaces/config.interface';

export const COLLECTION_METADATA_KEY = 'vertex:collection';

export function Collection(options: CollectionOptions): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(COLLECTION_METADATA_KEY, options, target);
  };
}