import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

type Role = 'Owner' | 'Admin' | 'Viewer';

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  orgId: string;
};

@Injectable()
export class AuthService {
  private users: UserRecord[] = [];

  constructor(private jwt: JwtService) {
    const hash = bcrypt.hashSync('Password123!', 10);
    this.users = [
      { id: 'u1', email: 'owner@test.com', passwordHash: hash, role: 'Owner', orgId: 'org1' },
      { id: 'u2', email: 'admin@test.com', passwordHash: hash, role: 'Admin', orgId: 'org1' },
      { id: 'u3', email: 'viewer@test.com', passwordHash: hash, role: 'Viewer', orgId: 'org1' },
    ];
  }

  async login(email: string, password: string) {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role, orgId: user.orgId };
    return {
      access_token: await this.jwt.signAsync(payload),
      user: { id: user.id, email: user.email, role: user.role, orgId: user.orgId },
    };
  }
}
