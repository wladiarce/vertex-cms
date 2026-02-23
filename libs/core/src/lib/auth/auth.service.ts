import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { DatabaseRegistryService } from '../services/database-registry.service';
import { EmailService } from '../services/email.service';
import { ContentService } from '../services/content.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private readonly dbRegistry: DatabaseRegistryService,
    private emailService: EmailService,
    private contentService: ContentService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const repository = this.dbRegistry.getRepository('users');
    
    // Using findAll for custom filtering (email)
    const { docs } = await repository.findAll({
      filter: { email },
      limit: 1
    });
    
    const user = docs[0];

    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, name: user.name, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      return { valid: !!decoded };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async requestPasswordReset(email: string) {
    if (!this.emailService.isEnabled()) {
      throw new BadRequestException('Email service is not enabled');
    }

    const userRepository = this.dbRegistry.getRepository('users');
    const { docs: users } = await userRepository.findAll({ filter: { email }, limit: 1 });
    const user = users[0];

    if (!user) {
      // Return success silently to prevent user enumeration
      return { success: true };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await this.contentService.create('_password_resets', {
      userId: user._id,
      tokenHash,
      expiresAt,
      used: false
    });

    const resetUrl = `${process.env.ADMIN_URL || 'http://localhost:4200'}/admin/reset-password/${token}`;

    await this.emailService.sendTemplate('password-reset', email, {
      userName: user.name || user.email,
      appName: 'VertexCMS',
      resetUrl,
      expiresIn: '1 hour'
    });

    return { success: true };
  }

  async resetPassword(token: string, newPassword: any) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const { docs: resets } = await this.contentService.findAll('_password_resets', {
      tokenHash,
      used: false,
      status: 'all'
    });

    const resetRequest = resets[0];
    if (!resetRequest || new Date(resetRequest.expiresAt) < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const userRepository = this.dbRegistry.getRepository('users');
    
    await userRepository.update(resetRequest.userId, { password: hashedPassword });
    
    // Mark as used
    await this.contentService.update('_password_resets', resetRequest._id, { used: true });

    return { success: true };
  }
}