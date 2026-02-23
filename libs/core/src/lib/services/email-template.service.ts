import { Injectable, Logger } from '@nestjs/common';
import { ContentService } from './content.service';
import { EmailTemplate } from '../collections/email-template.collection';

@Injectable()
export class EmailTemplateService {
  private logger = new Logger(EmailTemplateService.name);

  constructor(private contentService: ContentService) {}

  async getTemplate(slug: string): Promise<EmailTemplate | null> {
    const results = await this.contentService.findAll('_email_templates', {
      slug,
      status: 'all' // Ensure we get it regardless of status if it's internal
    });
    return (results.docs[0] as EmailTemplate) || null;
  }

  async renderTemplate(slug: string, variables: Record<string, string>): Promise<{ subject: string; html: string; text?: string }> {
    const template = await this.getTemplate(slug);
    if (!template) {
      throw new Error(`Email template "${slug}" not found`);
    }

    return {
      subject: this.interpolate(template.subject, variables),
      html: this.interpolate(template.htmlBody, variables),
      text: template.textBody ? this.interpolate(template.textBody, variables) : undefined
    };
  }

  private interpolate(text: string, variables: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  async seedDefaultTemplates() {
    const defaults = [
      {
        slug: 'password-reset',
        name: 'Password Reset Email',
        subject: 'Reset your password for {{appName}}',
        htmlBody: '<p>Hi {{userName}},</p><p>You requested a password reset for <strong>{{appName}}</strong>.</p><p><a href="{{resetUrl}}">Click here to reset your password</a></p><p>If you did not request this, please ignore this email.</p><p>This link will expire in {{expiresIn}}.</p>',
        variables: 'userName,appName,resetUrl,expiresIn'
      },
      {
        slug: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to {{appName}}!',
        htmlBody: '<p>Hi {{userName}},</p><p>Your account has been created in <strong>{{appName}}</strong>.</p><p><a href="{{loginUrl}}">Log in to your account</a></p>',
        variables: 'userName,appName,loginUrl'
      }
    ];

    for (const def of defaults) {
      const existing = await this.getTemplate(def.slug);
      if (!existing) {
        this.logger.log(`Seeding default email template: ${def.slug}`);
        await this.contentService.create('_email_templates', def);
      }
    }
  }
}
