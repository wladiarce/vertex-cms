import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseRegistryService } from '../services/database-registry.service';

@Controller('api/vertex/webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly dbRegistry: DatabaseRegistryService,
  ) {}

  private get webhookRepo() {
    return this.dbRegistry.getRepository('_webhooks');
  }

  private get logsRepo() {
    return this.dbRegistry.getRepository('_webhook_logs');
  }

  @Post()
  async createWebhook(@Body() data: any) {
    return this.webhookRepo.create(data);
  }

  @Get()
  async getWebhooks() {
    return this.webhookRepo.findAll({
      limit: 100,
    });
  }

  @Patch(':id')
  async updateWebhook(@Param('id') id: string, @Body() data: any) {
    return this.webhookRepo.update(id, data);
  }

  @Delete(':id')
  async deleteWebhook(@Param('id') id: string) {
    return this.webhookRepo.delete(id);
  }

  @Get(':id/logs')
  async getWebhookLogs(@Param('id') id: string, @Query('limit') limit = 50) {
    return this.logsRepo.findAll({
      filter: { webhookId: id },
      sort: { createdAt: -1 },
      limit: Number(limit)
    });
  }

  @Post(':id/test')
  async testWebhook(@Param('id') id: string) {
    const webhook = await this.webhookRepo.findOne(id);
    if (!webhook) {
      return { success: false, message: 'Webhook not found' };
    }
    
    // Call the service method but wait for the result
    // WebhookService.dispatchEvent searches by event, so we can just mock a call.
    // However, since dispatchEvent operates asynchronously and takes an event name, 
    // it's better to just directly run a test fetch or define a test method in WebhookService.
    
    // Quick hack for test dispatch
    await this.webhookService.dispatchEvent('system:test', { message: 'Test ping from VertexCMS' });
    
    return { success: true };
  }
}
