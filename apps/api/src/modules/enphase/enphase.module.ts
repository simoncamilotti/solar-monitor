import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { EnphaseController } from './enphase.controller.js';
import { EnphaseMapper } from './enphase.mapper.js';
import { EnphaseService } from './enphase.service.js';
import { EnphaseApiService } from './enphase-api.service.js';
import { EnphaseAuthService } from './enphase-auth.service.js';
import { EnphaseSyncService } from './enphase-sync.service.js';

@Module({
  imports: [HttpModule.register({ timeout: 30_000 })],
  controllers: [EnphaseController],
  providers: [
    EnphaseAuthService,
    EnphaseApiService,
    EnphaseSyncService,
    EnphaseService,
    EnphaseMapper,
  ],
})
export class EnphaseModule {}
