import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SchemaDiscoveryService } from '../services/schema-discovery.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private discovery: SchemaDiscoveryService) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Try to validate the token using the standard Passport logic
    try {
      // super.canActivate returns true/false or throws
      const isValid = await super.canActivate(context);
      if (isValid) return true;
    } catch (err) {
      // If token is invalid or missing, 'super' might throw. 
      // We catch it and proceed to check for Public Access.
    }

    // 2. If we are here, the user is NOT logged in.
    // Let's check if the route allows Public Access.
    const request = context.switchToHttp().getRequest();
    
    // We expect the route to be /api/content/:slug
    // We can extract params from the request object
    const slug = request.params.slug; 

    // Only allow GET requests for public
    if (request.method !== 'GET') {
      throw new UnauthorizedException('You must be logged in to modify content');
    }

    if (slug) {
      const config = this.discovery.getCollection(slug);
      
      // Check if 'public' is in the read access array
      if (config?.access?.read?.includes('public')) {
        return true; // ALLOW ACCESS
      }
    }

    // 3. If neither valid token nor public access -> Block
    throw new UnauthorizedException();
  }

  // Handle the scenario where Passport returns 'null' user without throwing
  override handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If we have a user, great.
    if (user) return user;
    
    // If no user, we don't throw yet. We return null so canActivate can check public access.
    return null;
  }
}