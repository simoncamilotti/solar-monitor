import { z } from 'zod';

export const userSchema = z
  .object({
    id: z.uuid(),
    email: z.email(),
    name: z.string(),
    locale: z.string(),
  })
  .meta({ id: 'User' });
export type User = z.infer<typeof userSchema>;
