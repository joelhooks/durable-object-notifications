import { z } from 'zod';

export type NotificationLevel = 'everything' | 'digest' | 'quiet';

export const UserPreferencesSchema = z.object({
  userId: z.string(),
  defaultLevel: z.enum(['everything', 'digest', 'quiet']),
  email: z.boolean(),
  web: z.boolean(),
  digestFrequency: z.enum(['daily', 'weekly']).optional()
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>; 