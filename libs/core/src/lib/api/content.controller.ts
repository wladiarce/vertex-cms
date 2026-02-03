import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ContentService } from '../services/content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get(':slug')
  async findAll(@Param('slug') slug: string, @Query() query: any) {
    return this.contentService.findAll(slug, query);
  }

  @Get(':slug/:id')
  async findOne(
    @Param('slug') slug: string, 
    @Param('id') id: string,
    @Query('locale') locale?: string,
    @Query('raw') raw?: string  // If 'true', skip locale transformation for admin
  ) {
    return this.contentService.findOne(slug, id, locale, raw === 'true');
  }

  @Post(':slug')
  async create(@Param('slug') slug: string, @Body() body: any) {
    return this.contentService.create(slug, body);
  }

  @Patch(':slug/:id')
  async update(@Param('slug') slug: string, @Param('id') id: string, @Body() body: any) {
    return this.contentService.update(slug, id, body);
  }

  @Delete(':slug/:id')
  async delete(@Param('slug') slug: string, @Param('id') id: string) {
    return this.contentService.delete(slug, id);
  }

  @Patch(':slug/:id/publish')
  async publish(@Param('slug') slug: string, @Param('id') id: string) {
    return this.contentService.publish(slug, id);
  }

  @Patch(':slug/:id/unpublish')
  async unpublish(@Param('slug') slug: string, @Param('id') id: string) {
    return this.contentService.unpublish(slug, id);
  }

  @Get(':slug/:id/versions')
  async getVersions(@Param('slug') slug: string, @Param('id') id: string) {
    return this.contentService.getVersions(slug, id);
  }

  @Post(':slug/:id/restore/:versionId')
  async restoreVersion(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Param('versionId') versionId: string
  ) {
    return this.contentService.restoreVersion(slug, id, versionId);
  }
}