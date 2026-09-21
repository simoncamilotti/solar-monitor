import { createZodDto } from 'nestjs-zod';

import {
  enphaseBackfillRequestDtoSchema,
  enphaseBackfillResponseDtoSchema,
  enphaseCallbackResponseDtoSchema,
  enphaseSyncRequestDtoSchema,
  enphaseSyncResponseDtoSchema,
  enphaseSystemDtoSchema,
  lifetimeDataResponseDtoSchema,
  syncScheduleDtoSchema,
  syncStatusResponseDtoSchema,
  updateSyncScheduleRequestDtoSchema,
} from '@/shared-models';

export class EnphaseSystemDto extends createZodDto(enphaseSystemDtoSchema) {}

export class EnphaseCallbackResponseDto extends createZodDto(enphaseCallbackResponseDtoSchema) {}

export class EnphaseSyncRequestDto extends createZodDto(enphaseSyncRequestDtoSchema) {}

export class EnphaseSyncResponseDto extends createZodDto(enphaseSyncResponseDtoSchema) {}

export class EnphaseBackfillRequestDto extends createZodDto(enphaseBackfillRequestDtoSchema) {}

export class EnphaseBackfillResponseDto extends createZodDto(enphaseBackfillResponseDtoSchema) {}

export class LifetimeDataResponseDto extends createZodDto(lifetimeDataResponseDtoSchema) {}

export class SyncStatusResponseDto extends createZodDto(syncStatusResponseDtoSchema) {}

export class SyncScheduleDto extends createZodDto(syncScheduleDtoSchema) {}

export class UpdateSyncScheduleRequestDto extends createZodDto(updateSyncScheduleRequestDtoSchema) {}
