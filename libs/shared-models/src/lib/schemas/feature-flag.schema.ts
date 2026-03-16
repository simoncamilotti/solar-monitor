import { z } from 'zod';

export const featureFlagDtoSchema = z.object({
  key: z.string(),
  enabled: z.boolean(),
});

export const createFeatureFlagDtoRequestSchema = featureFlagDtoSchema;

export const updateFeatureFlagRequestDtoSchema = z.object({
  enabled: z.boolean(),
});

export type FeatureFlagDto = z.infer<typeof featureFlagDtoSchema>;
export type CreateFeatureFlagRequestDto = z.infer<typeof createFeatureFlagDtoRequestSchema>;
export type UpdateFeatureFlagRequestDto = z.infer<typeof updateFeatureFlagRequestDtoSchema>;
