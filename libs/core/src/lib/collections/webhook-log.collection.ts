import { Collection, Field, FieldType } from '@vertex-cms/common';

@Collection({
  slug: '_webhook_logs',
  singularName: 'Webhook Log',
  timestamps: true,
  drafts: false,
  access: { 
    read: ['admin'], 
    create: [], 
    update: [], 
    delete: ['admin'] // Allow manual cleanup
  }
})
export class WebhookLog {
  @Field({ type: FieldType.Text, required: true })
  webhookId!: string;

  @Field({ type: FieldType.Text, required: true })
  event!: string; // e.g. "pages:create"

  @Field({ type: FieldType.Text, required: true })
  url!: string;

  @Field({ type: FieldType.Number, required: true })
  statusCode!: number;

  @Field({ type: FieldType.Boolean, required: true })
  success!: boolean;

  @Field({ type: FieldType.Text })
  requestPayload?: string; // JSON string

  @Field({ type: FieldType.Text })
  responseBody?: string;

  @Field({ type: FieldType.Number })
  durationMs!: number;
}
