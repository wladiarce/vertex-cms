import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectConnection() private connection: Connection
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // We access the 'users' model directly
    const userModel = this.connection.model('users');
    const user = await userModel.findOne({ email }).select('+password').lean(); // Select password explicitly because afterRead might hide it? No, raw query access.

    if (user && await bcrypt.compare(pass, (user as any)['password'])) {
      const { password, ...result } = user as any;
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