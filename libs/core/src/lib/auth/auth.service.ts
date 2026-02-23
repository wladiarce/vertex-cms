import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseRegistryService } from '../services/database-registry.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly dbRegistry: DatabaseRegistryService
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
    const payload = { email: user.email, name: user.name,sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      return {valid: !!decoded};
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}