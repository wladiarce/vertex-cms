import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/vertex/tokens')
@UseGuards(JwtAuthGuard)
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  async createToken(@Request() req: any, @Body() body: any) {
    const { name, scopes, expiresAt } = body;
    const userId = req.user.id || req.user.sub || req.user._id;

    // We assume scopes comes as an array of strings like ["pages:read", "posts:write"]
    // Convert to comma-separated string for storage
    const scopesStr = Array.isArray(scopes) ? scopes.join(',') : String(scopes || '*:*');

    // Make sure expiresAt is a date or undefined
    const expiryDate = expiresAt ? new Date(expiresAt) : undefined;
    
    return this.tokenService.generateToken(name, scopesStr, userId, expiryDate);
  }

  @Get()
  async getTokens() {
    return this.tokenService.listTokens();
  }

  @Delete(':id')
  async revokeToken(@Param('id') id: string) {
    return this.tokenService.revokeToken(id);
  }
}
