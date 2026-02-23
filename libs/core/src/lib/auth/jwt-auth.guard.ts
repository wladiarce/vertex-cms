import { ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SchemaDiscoveryService } from '../services/schema-discovery.service';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private discovery: SchemaDiscoveryService,
    private tokenService: TokenService
  ) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    // Check for API token first
    if (authHeader && authHeader.startsWith('Bearer vtx_')) {
      const rawToken = authHeader.replace('Bearer ', '');
      const tokenDoc = await this.tokenService.validateToken(rawToken);
      
      if (tokenDoc) {
        // Record last used time
        this.tokenService.updateLastUsed(tokenDoc._id || tokenDoc.id);

        request.user = {
          type: 'api_token',
          tokenId: tokenDoc._id || tokenDoc.id,
          scopes: tokenDoc.scopes?.split(',') || []
        };

        // Determine required scope. Example: 'pages:read' or 'pages:write'
        let requiredAction = 'read';
        if (request.method !== 'GET') requiredAction = 'write';
        
        let requiredScope = '';
        let urlSlug = '';

        if (request.url.includes('/api/content/')) {
          const parts = request.url.split('/api/content/')[1].split('?')[0].split('/');
          urlSlug = parts[0];
          requiredScope = `${urlSlug}:${requiredAction}`;
        } else {
           // Admin APIs or others requires generic scope
           requiredScope = `admin:${requiredAction}`; 
        }

        const hasScope = request.user.scopes.includes('*:*') || 
                         request.user.scopes.includes(requiredScope) || 
                         (urlSlug && request.user.scopes.includes(`${urlSlug}:*`));
        
        if (!hasScope) {
          throw new ForbiddenException(`Missing required scope: ${requiredScope}`);
        }

        return true;
      }
    }

    // 1. Try to validate the token using the standard Passport logic
    try {
      // super.canActivate returns true/false or throws
      const isValid = await (super.canActivate(context) as Promise<boolean>);
      if (isValid) return true;
    } catch (err) {
      // If token is invalid or missing, 'super' might throw. 
      // We catch it and proceed to check for Public Access.
    }

    // 2. If we are here, the user is NOT logged in.
    // Let's check if the route allows Public Access.
    
    // We expect the route to be /api/content/:slug
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
    if (err) throw err;
    // If we have a user, great.
    if (user) return user;
    
    // If no user, we don't throw yet. We return null so canActivate can check public access.
    return null;
  }
}
