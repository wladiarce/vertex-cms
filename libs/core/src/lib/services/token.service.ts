import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { DatabaseRegistryService } from './database-registry.service';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly dbRegistry: DatabaseRegistryService,
  ) {}

  private get repository() {
    return this.dbRegistry.getRepository('_api_tokens');
  }

  /**
   * Generates a new API token. 
   * Returns the raw token ONCE. It is stored as a SHA-256 hash.
   */
  async generateToken(name: string, scopes: string, userId: string, expiresAt?: Date) {
    // Generate secure random token
    const randomHex = crypto.randomBytes(32).toString('hex');
    const rawToken = `vtx_${randomHex}`;
    
    // Create token prefix for identification
    const prefix = rawToken.substring(0, 12);
    
    // Hash token for storage
    const tokenHash = this.hashToken(rawToken);

    const doc = await this.repository.create({
      name,
      tokenHash,
      prefix,
      scopes,
      createdBy: userId,
      revoked: false,
      expiresAt,
    });

    return { rawToken, doc };
  }

  /**
   * Validates a raw token from an Authorization header.
   */
  async validateToken(rawToken: string) {
    if (!rawToken || !rawToken.startsWith('vtx_')) return null;

    const tokenHash = this.hashToken(rawToken);

    const result = await this.repository.findAll({
      filter: { tokenHash },
      limit: 1,
    });

    const tokenDoc = result.docs[0];
    if (!tokenDoc) return null;

    if (tokenDoc.revoked) return null;

    if (tokenDoc.expiresAt && new Date() > new Date(tokenDoc.expiresAt)) {
      return null;
    }

    return tokenDoc;
  }

  /**
   * Revokes an existing token by ID.
   */
  async revokeToken(tokenId: string) {
    const updated = await this.repository.update(tokenId, { revoked: true });
    return updated;
  }

  /**
   * Lists all tokens for the admin panel, omitting hashes.
   */
  async listTokens() {
    const result = await this.repository.findAll({
      limit: 100, // could add pagination later
      sort: { createdAt: -1 },
    });

    // Remove tokenHash from output
    return result.docs.map(doc => {
      const { tokenHash, ...safeDoc } = doc;
      return safeDoc;
    });
  }

  /**
   * Updates lastUsedAt. Needs to be debounced if called often.
   */
  async updateLastUsed(tokenId: string) {
    // Fire and forget updating last access time
    this.repository.update(tokenId, { lastUsedAt: new Date() }).catch(err => {
      this.logger.warn(`Failed to update lastUsedAt for token ${tokenId}: ${err.message}`);
    });
  }

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }
}
