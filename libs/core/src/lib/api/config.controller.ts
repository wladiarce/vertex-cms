import { Controller, Get } from '@nestjs/common';
import { SchemaDiscoveryService } from '../services/schema-discovery.service';

@Controller('api/vertex/config')
export class ConfigController {
  constructor(private readonly discovery: SchemaDiscoveryService) {}

  @Get()
  getConfig() {
    // Returns the full JSON metadata of all collections
    return {
      collections: this.discovery.getAllCollections()
    };
  }
}