import { Injectable, Inject, Logger } from '@nestjs/common';
import { EmailAdapter, EmailMessage, EmailSendResult } from '@vertex-cms/common';
import * as nodemailer from 'nodemailer';

export interface SmtpOptions {
  host: string;
  port: number;
  secure?: boolean;
  auth?: { user: string; pass: string };
  from: string;  // Default sender address
}

@Injectable()
export class SmtpEmailAdapter extends EmailAdapter {
  private transporter: nodemailer.Transporter;
  private logger = new Logger(SmtpEmailAdapter.name);

  constructor(@Inject('EMAIL_SMTP_OPTIONS') private options: SmtpOptions) {
    super();
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure ?? false,
      auth: options.auth,
    });
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    try {
      const info = await this.transporter.sendMail({
        from: message.from || this.options.from,
        to: Array.isArray(message.to) ? message.to.join(', ') : message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
        cc: message.cc,
        bcc: message.bcc,
        attachments: message.attachments?.map(a => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType
        })),
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified');
      return true;
    } catch (err: any) {
      this.logger.warn(`SMTP connection verification failed: ${err.message}`);
      return false;
    }
  }
}
