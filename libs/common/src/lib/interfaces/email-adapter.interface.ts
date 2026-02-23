export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;         // Plain-text fallback
  from?: string;         // Override default sender
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export abstract class EmailAdapter {
  abstract send(message: EmailMessage): Promise<EmailSendResult>;
  abstract verify(): Promise<boolean>;  // Test connection on startup
}
