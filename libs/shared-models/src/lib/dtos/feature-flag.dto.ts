import { createZodDto } from 'nestjs-zod';

import {
  createFeatureFlagDtoRequestSchema,
  featureFlagDtoSchema,
  updateFeatureFlagRequestDtoSchema,
} from '../schemas/feature-flag.schema';

export class FeatureFlagDto extends createZodDto(featureFlagDtoSchema) {}

export class CreateFeatureFlagRequestDto extends createZodDto(createFeatureFlagDtoRequestSchema) {}

export class UpdateFeatureFlagRequestDto extends createZodDto(updateFeatureFlagRequestDtoSchema) {}
