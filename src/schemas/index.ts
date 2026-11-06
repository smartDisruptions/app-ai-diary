import { z } from 'zod';

export const moodPointSchema = z.object({
  date: z.string(),
  mood: z.string(),
  valence: z.number().min(-1).max(1),
});

export const emotionDataSchema = z.object({
  patterns: z.array(z.string()),
  recentMood: z.string(),
  moodHistory: z.array(moodPointSchema),
});

export const bigFiveSchema = z.object({
  openness: z.number().min(0).max(100),
  conscientiousness: z.number().min(0).max(100),
  extraversion: z.number().min(0).max(100),
  agreeableness: z.number().min(0).max(100),
  neuroticism: z.number().min(0).max(100),
});

export const writingStyleSchema = z.object({
  formality: z.number().min(0).max(100),
  verbosity: z.number().min(0).max(100),
  topTopics: z.array(z.string()),
  vocabularyLevel: z.string(),
});

export const personalityProfileSchema = z.object({
  emotions: emotionDataSchema,
  bigFive: bigFiveSchema,
  writingStyle: writingStyleSchema,
  lastUpdated: z.string(),
  entryCount: z.number().int().min(0),
  observation: z.string().optional(),
});

export const entrySchema = z.object({
  id: z.string(),
  date: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string(),
});

export const settingsSchema = z.object({
  apiKey: z.string(),
  model: z.string(),
  userName: z.string(),
  companionName: z.string().optional(),
});
