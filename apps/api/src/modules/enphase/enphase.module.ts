import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { EnphaseController } from './controllers/enphase.controller';
import { EnphaseMapper } from './mappers/enphase.mapper';
import { EnphaseService } from './services/enphase.service';
import { EnphaseApiService } from './services/enphase-api.service';
import { EnphaseAuthService } from './services/enphase-auth.service';
import { EnphaseSyncService } from './services/enphase-sync.service';

@Module({
  imports: [HttpModule.register({ timeout: 30_000 })],
  controllers: [EnphaseController],
  providers: [EnphaseAuthService, EnphaseApiService, EnphaseSyncService, EnphaseService, EnphaseMapper],
})
export class EnphaseModule {}
