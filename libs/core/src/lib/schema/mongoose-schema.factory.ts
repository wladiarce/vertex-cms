import { Injectable } from '@nestjs/common';
import { Schema } from 'mongoose';
import { CollectionMetadata, FieldType, FieldOptions, DocumentStatus } from '@vertex/common';

@Injectable()
export class MongooseSchemaFactory {
  
  createSchema(metadata: CollectionMetadata): Schema {
    const schemaDefinition: Record<string, any> = {};

    metadata.fields.forEach((field) => {
      schemaDefinition[field.name] = this.mapFieldToMongoose(field);
    });

    // Add draft system fields if enabled (default: true)
    const draftsEnabled = metadata.drafts !== false; // Default to true
    if (draftsEnabled) {
      schemaDefinition['status'] = {
        type: String,
        enum: [DocumentStatus.Draft, DocumentStatus.Published, DocumentStatus.Archived],
        default: DocumentStatus.Draft
      };
      schemaDefinition['publishedAt'] = {
        type: Date,
        required: false
      };
    }

    const schema = new Schema(schemaDefinition, { 
      timestamps: metadata.timestamps || false 
    });

    return schema;
  }

  private mapFieldToMongoose(field: FieldOptions) {
    const base: any = { required: field.required || false };

    // If field is localized, store as Mixed object to support { en: "value", es: "valor" } structure
    if (field.localized) {
      return { ...base, type: Schema.Types.Mixed };
    }

    switch (field.type) {
      case FieldType.Text:
      case FieldType.Email:
      case FieldType.RichText:
        return { ...base, type: String };
        
      case FieldType.Number:
        return { ...base, type: Number };
        
      case FieldType.Boolean:
        return { ...base, type: Boolean };
        
      case FieldType.Date:
        return { ...base, type: Date };

      case FieldType.Select:
        return { 
          ...base, 
          type: String, 
          enum: field.options?.map(o => o.value) 
        };

      // Crucial: Relationships are stored as ObjectIds
      case FieldType.Relationship:
        // Support both single and many-to-many relationships
        const relationshipType = { 
          type: Schema.Types.ObjectId, 
          ref: field.relationTo // We will ensure this string matches the Mongoose model name
        };
        
        if (field.relationMany) {
          // Many-to-many: array of ObjectIds
          return { ...base, type: [relationshipType] };
        }
        
        // One-to-one: single ObjectId
        return { ...base, ...relationshipType };

      case FieldType.Blocks:
        // We store blocks as a generic array of objects.
        // Structure: [ { blockType: 'hero', ...fields }, { blockType: 'text', ...fields } ]
        return { 
          ...base, 
          type: [Schema.Types.Mixed] // Array of Mixed
        };

      default:
        return { ...base, type: Schema.Types.Mixed };
    }
  }
}