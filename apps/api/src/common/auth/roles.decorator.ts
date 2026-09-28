import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Requires at least one of these roles, read from the token (ADR 0009). */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
