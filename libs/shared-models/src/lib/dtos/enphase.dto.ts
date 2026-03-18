import { createZodDto } from 'nestjs-zod';

import {
  enphaseBackfillResponseDtoSchema,
  enphaseCallbackResponseDtoSchema,
  enphaseSyncResponseDtoSchema,
  enphaseSystemDtoSchema,
  lifetimeDataDtoSchema,
  lifetimeDataResponseDtoSchema,
} from '../schemas/enphase.schema';

export class EnphaseSystemDto extends createZodDto(enphaseSystemDtoSchema) {}

export class EnphaseCallbackResponseDto extends createZodDto(enphaseCallbackResponseDtoSchema) {}

export class EnphaseSyncResponseDto extends createZodDto(enphaseSyncResponseDtoSchema) {}

export class EnphaseBackfillResponseDto extends createZodDto(enphaseBackfillResponseDtoSchema) {}

export class LifetimeDataDto extends createZodDto(lifetimeDataDtoSchema) {}

export class LifetimeDataResponseDto extends createZodDto(lifetimeDataResponseDtoSchema) {}
