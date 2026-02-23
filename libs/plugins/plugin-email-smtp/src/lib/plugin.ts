import { VertexPlugin } from '@vertex-cms/common';
import { VertexPluginEmailSmtpModule } from './vertex-plugin-email-smtp.module';
import { SmtpOptions } from './smtp.adapter';

export const EmailSmtpPlugin = (options: SmtpOptions): VertexPlugin => ({
  name: 'email-smtp',
  type: 'email',
  module: VertexPluginEmailSmtpModule.register(options),
});
export * from './smtp.adapter';
