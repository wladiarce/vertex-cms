import { Injectable, Inject, Optional } from '@nestjs/common';
import { EmailAdapter, EmailMessage, EmailSendResult } from '@vertex-cms/common';
import { PluginRegistryService } from './plugin-registry.service';
import { EmailTemplateService } from './email-template.service';

@Injectable()
export class EmailService {
  private adapter: EmailAdapter | null = null;

  constructor(
    private pluginRegistry: PluginRegistryService,
    private templateService: EmailTemplateService,
    @Optional() @Inject(EmailAdapter) adapter?: EmailAdapter
  ) {
    this.adapter = adapter || null;
  }

  /** Check if email is available */
  isEnabled(): boolean {
    return this.adapter !== null && this.pluginRegistry.hasCapability('email');
  }

  /** Send a raw email */
  async send(message: EmailMessage): Promise<EmailSendResult> {
    if (!this.isEnabled()) {
      return { success: false, error: 'Email plugin not configured' };
    }
    return this.adapter!.send(message);
  }

  /** Send a templated email */
  async sendTemplate(
    templateSlug: string,
    to: string | string[],
    variables: Record<string, string>
  ): Promise<EmailSendResult> {
    if (!this.isEnabled()) {
      return { success: false, error: 'Email plugin not configured' };
    }
    const rendered = await this.templateService.renderTemplate(templateSlug, variables);
    return this.adapter!.send({
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
  }
}
