import { createZodDto } from 'nestjs-zod';

import {
  enphaseBackfillResponseDtoSchema,
  enphaseCallbackResponseDtoSchema,
  enphaseSyncResponseDtoSchema,
  enphaseSystemDtoSchema,
  lifetimeDataResponseDtoSchema,
  syncStatusResponseDtoSchema,
} from '@/shared-models';

export class EnphaseSystemDto extends createZodDto(enphaseSystemDtoSchema) {}

export class EnphaseCallbackResponseDto extends createZodDto(enphaseCallbackResponseDtoSchema) {}

export class EnphaseSyncResponseDto extends createZodDto(enphaseSyncResponseDtoSchema) {}

export class EnphaseBackfillResponseDto extends createZodDto(enphaseBackfillResponseDtoSchema) {}

export class LifetimeDataResponseDto extends createZodDto(lifetimeDataResponseDtoSchema) {}

export class SyncStatusResponseDto extends createZodDto(syncStatusResponseDtoSchema) {}
