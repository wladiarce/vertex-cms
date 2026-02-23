import { Injectable, Logger } from '@nestjs/common';
import { DatabaseRegistryService } from './database-registry.service';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly dbRegistry: DatabaseRegistryService,
  ) {}

  private get webhookRepo() {
    return this.dbRegistry.getRepository('_webhooks');
  }

  private get logsRepo() {
    return this.dbRegistry.getRepository('_webhook_logs');
  }

  /**
   * Dispatches an event to all matching webhooks.
   * This should be called primarily in fire-and-forget mode.
   * 
   * @param event e.g., "pages:create"
   * @param payload The data to send
   */
  async dispatchEvent(event: string, payload: any) {
    try {
      // Find active webhooks
      const result = await this.webhookRepo.findAll({
        filter: { active: true }
      });

      const webhooks = result.docs.filter(w => {
        const events = w.events ? w.events.split(',') : [];
        return events.includes('*') || events.includes('*:*') || events.includes(event);
      });

      if (webhooks.length === 0) return;

      this.logger.debug(`Dispatching event ${event} to ${webhooks.length} webhooks`);

      // Fire all asynchronously
      Promise.allSettled(webhooks.map(w => this.sendWebhook(w, event, payload)));

    } catch (err: any) {
      this.logger.error(`Error finding webhooks for event ${event}: ${err.message}`);
    }
  }

  private async sendWebhook(webhook: any, event: string, payload: any) {
    const startTime = Date.now();
    const bodyString = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
    
    let statusCode = 0;
    let success = false;
    let responseText = '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'VertexCMS-Webhook/1.0',
      'X-Vertex-Event': event,
    };

    if (webhook.secret) {
      const signature = crypto.createHmac('sha256', webhook.secret)
        .update(bodyString)
        .digest('hex');
      headers['X-Vertex-Signature'] = `sha256=${signature}`;
    }

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: bodyString,
      });

      statusCode = response.status;
      success = response.ok;
      responseText = await response.text();
      // limit response text length to prevent huge DB rows
      if (responseText.length > 500) {
        responseText = responseText.substring(0, 500) + '...';
      }
    } catch (err: any) {
      this.logger.error(`Webhook ${webhook.url} failed: ${err.message}`);
      responseText = err.message;
    }

    const duration = Date.now() - startTime;

    // Log the result
    try {
      await this.logsRepo.create({
        webhookId: webhook._id || webhook.id,
        event,
        url: webhook.url,
        statusCode,
        success,
        durationMs: duration,
        requestPayload: bodyString,
        responseBody: responseText
      });
    } catch (logErr: any) {
      this.logger.error(`Failed to save webhook log: ${logErr.message}`);
    }
  }
}
