import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ContentService } from '../services/content.service';

@Controller('api/content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get(':slug')
  async findAll(@Param('slug') slug: string, @Query() query: any) {
    return this.contentService.findAll(slug, query);
  }

  @Get(':slug/:id')
  async findOne(@Param('slug') slug: string, @Param('id') id: string) {
    return this.contentService.findOne(slug, id);
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
}