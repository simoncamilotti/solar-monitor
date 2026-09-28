import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Opens a route to unauthenticated requests: every route requires a valid token by default (ADR 0009). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
