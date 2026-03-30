import type { PersonalityProfile, Message, Settings } from '@/types';
import { chatCompletion } from '@/lib/api/openrouter';
import { buildCompanionSystemPrompt } from './prompts';

export async function sendCompanionMessage(
  history: Message[],
  profile: PersonalityProfile | null,
  settings: Settings
): Promise<string> {
  const systemPrompt = buildCompanionSystemPrompt(profile, settings);

  const recentHistory = history.slice(-20);

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...recentHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  return chatCompletion(messages, settings.model, settings.apiKey);
}
