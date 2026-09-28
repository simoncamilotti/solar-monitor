import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service.js';
import { JWTPayload } from './jwt-payload.type.js';
import type { PrismaUser } from './prisma-user.type.js';

@Injectable()
export class AuthService {
  constructor(private readonly _prismaService: PrismaService) {}

  async getOrCreateUser(jwtPayload: JWTPayload): Promise<PrismaUser> {
    const existingUser = await this._prismaService.user.findUnique({
      where: {
        keycloakId: jwtPayload.sub,
      },
    });

    if (existingUser != null) {
      return existingUser;
    }

    return this._prismaService.user.create({
      data: {
        keycloakId: jwtPayload.sub,
      },
    });
  }
}
