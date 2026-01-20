import { Injectable } from '@nestjs/common';
import { Schema } from 'mongoose';
import { CollectionMetadata, FieldType, FieldOptions } from '@vertex/common';

@Injectable()
export class MongooseSchemaFactory {
  
  createSchema(metadata: CollectionMetadata): Schema {
    const schemaDefinition: Record<string, any> = {};

    metadata.fields.forEach((field) => {
      schemaDefinition[field.name] = this.mapFieldToMongoose(field);
    });

    const schema = new Schema(schemaDefinition, { 
      timestamps: metadata.timestamps || false 
    });

    return schema;
  }

  private mapFieldToMongoose(field: FieldOptions) {
    const base: any = { required: field.required || false };

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
        return { 
          ...base, 
          type: Schema.Types.ObjectId, 
          ref: field.relationTo // We will ensure this string matches the Mongoose model name
        };

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