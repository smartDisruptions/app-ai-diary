import type { PersonalityProfile, Entry, Settings } from '@/types';
import { personalityProfileSchema } from '@/schemas';
import { chatCompletion } from '@/lib/api/openrouter';
import { buildAnalysisPrompt, buildFullRecomputePrompt } from './prompts';

function parseProfileResponse(raw: string): PersonalityProfile {
  const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return personalityProfileSchema.parse(parsed);
}

export async function analyzeEntry(
  profile: PersonalityProfile | null,
  entry: Entry,
  settings: Settings
): Promise<PersonalityProfile> {
  const { system, user } = buildAnalysisPrompt(profile, entry);
  const messages = [
    { role: 'system' as const, content: system },
    { role: 'user' as const, content: user },
  ];

  const response = await chatCompletion(messages, settings.model, settings.apiKey);

  try {
    return parseProfileResponse(response);
  } catch {
    // Retry once on parse failure
    const retryResponse = await chatCompletion(messages, settings.model, settings.apiKey);
    return parseProfileResponse(retryResponse);
  }
}

export async function fullRecompute(
  entries: Entry[],
  settings: Settings
): Promise<PersonalityProfile> {
  const recent = entries
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 50);

  const { system, user } = buildFullRecomputePrompt(recent);
  const messages = [
    { role: 'system' as const, content: system },
    { role: 'user' as const, content: user },
  ];

  const response = await chatCompletion(messages, settings.model, settings.apiKey);

  try {
    return parseProfileResponse(response);
  } catch {
    const retryResponse = await chatCompletion(messages, settings.model, settings.apiKey);
    return parseProfileResponse(retryResponse);
  }
}
