import { Global, Module } from '@nestjs/common';
import { jwksProvider } from './jwks.provider.js';
import { TokenVerifier } from './token-verifier.service.js';

@Global()
@Module({
  providers: [jwksProvider, TokenVerifier],
  exports: [TokenVerifier],
})
export class AuthModule {}
