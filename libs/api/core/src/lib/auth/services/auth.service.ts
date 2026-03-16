import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/services/prisma.service';
import { JWTPayload } from '../types/jwt-payload.type';
import type { User } from '../types/user.type';

@Injectable()
export class AuthService {
  constructor(private readonly _prismaService: PrismaService) {}

  async getOrCreateUser(jwtPayload: JWTPayload): Promise<User> {
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
