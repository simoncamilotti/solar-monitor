import { Controller, Get } from '@nestjs/common';
import { userSchema } from '@repo/contracts';
import type { AuthUser } from '../../common/auth/auth-user.js';
import { CurrentUser } from '../../common/auth/current-user.decorator.js';
import { ResponseSchema } from '../../common/serialization/response-schema.decorator.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ResponseSchema(userSchema)
  async me(@CurrentUser() caller: AuthUser) {
    const { user } = await this.users.findOrCreate(caller);
    return user;
  }
}
