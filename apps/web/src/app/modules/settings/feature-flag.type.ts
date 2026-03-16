import { z } from 'zod';

export const featureFlagFormSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z]+(-[a-z]+)*$/, 'Feature flag key must be lowercase letters separated by hyphens'),
});

export type FeatureFlagForm = z.infer<typeof featureFlagFormSchema>;
