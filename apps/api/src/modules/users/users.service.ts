import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { PrismaService } from '../../common/database/prisma.service.js';
import type { User } from '../../generated/prisma/client.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns the local account of the caller, created at their first request. */
  async findOrCreate(caller: AuthUser): Promise<{ user: User; created: boolean }> {
    const profile = {
      email: caller.email,
      name: caller.name,
      ...(caller.locale ? { locale: caller.locale } : {}),
    };
    const existing = await this.prisma.user.findUnique({ where: { subject: caller.subject } });
    if (existing) {
      const user = await this.prisma.user.update({ where: { id: existing.id }, data: profile });
      return { user, created: false };
    }
    const user = await this.prisma.user.create({ data: { subject: caller.subject, ...profile } });
    return { user, created: true };
  }
}
