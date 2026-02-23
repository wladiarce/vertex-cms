import { Global, Module, DynamicModule } from '@nestjs/common';
import { EmailAdapter } from '@vertex-cms/common';
import { SmtpEmailAdapter, SmtpOptions } from './smtp.adapter';

@Global()
@Module({})
export class VertexPluginEmailSmtpModule {
  static register(options: SmtpOptions): DynamicModule {
    return {
      module: VertexPluginEmailSmtpModule,
      providers: [
        { provide: 'EMAIL_SMTP_OPTIONS', useValue: options },
        { provide: EmailAdapter, useClass: SmtpEmailAdapter },
      ],
      exports: [EmailAdapter],
    };
  }
}
