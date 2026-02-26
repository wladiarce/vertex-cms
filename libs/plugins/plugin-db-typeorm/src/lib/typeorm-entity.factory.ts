import { EntitySchema, EntitySchemaColumnOptions } from 'typeorm';
import { CollectionMetadata, FieldType, FieldOptions } from '@vertex-cms/common';

export class TypeORMEntityFactory {
  createEntity(metadata: CollectionMetadata): EntitySchema {
    const columns: Record<string, EntitySchemaColumnOptions> = {
      id: {
        type: 'uuid',
        primary: true,
        generated: 'uuid',
      },
      createdAt: {
        type: 'timestamp',
        createDate: true,
      },
      updatedAt: {
        type: 'timestamp',
        updateDate: true,
      },
    };

    const relations: Record<string, any> = {};

    metadata.fields.forEach((field) => {
      // Handle non-relationship fields
      if (field.type !== FieldType.Relationship) {
        columns[field.name] = this.mapFieldToColumn(field);
      } else {
        // Handle Relationships
        relations[field.name] = {
          type: field.hasMany ? 'many-to-many' : 'many-to-one',
          target: field.relationTo,
          joinColumn: !field.hasMany,
          joinTable: field.hasMany,
          cascade: true,
        };
      }
    });

    // Handle Draft system
    if (metadata.drafts !== false) {
      columns['status'] = {
        type: 'varchar',
        default: 'draft',
      };
      columns['publishedAt'] = {
        type: 'timestamp',
        nullable: true,
      };
    }

    return new EntitySchema({
      name: metadata.slug,
      tableName: metadata.slug,
      columns,
      relations,
    });
  }

  private mapFieldToColumn(field: FieldOptions): EntitySchemaColumnOptions {
    const base: Partial<EntitySchemaColumnOptions> = {
      nullable: !field.required,
    };

    // If localized, we might need a different strategy for SQL (e.g. JSON column or separate translation table)
    // For simplicity in Phase 1, we'll use a JSON/simple-json column for localized fields
    if (field.localized) {
      return { ...base, type: 'simple-json' } as EntitySchemaColumnOptions;
    }

    switch (field.type) {
      case FieldType.Text:
      case FieldType.Email:
        return { ...base, type: 'varchar' } as EntitySchemaColumnOptions;
      
      case FieldType.RichText:
        return { ...base, type: 'text' } as EntitySchemaColumnOptions;

      case FieldType.Number:
        return { ...base, type: 'float' } as EntitySchemaColumnOptions;

      case FieldType.Boolean:
        return { ...base, type: 'boolean' } as EntitySchemaColumnOptions;

      case FieldType.Date:
        return { ...base, type: 'timestamp' } as EntitySchemaColumnOptions;

      case FieldType.Select:
        // hasMany selects (multi-select) use simple-json to store arrays
        return { ...base, type: field.hasMany ? 'simple-json' : 'varchar' } as EntitySchemaColumnOptions;

      case FieldType.Blocks:
        return { ...base, type: 'simple-json' } as EntitySchemaColumnOptions;

      default:
        return { ...base, type: 'text' } as EntitySchemaColumnOptions;
    }
  }
}
