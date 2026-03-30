import type { PersonalityProfile, Entry, Settings } from '@/types';

export function buildAnalysisPrompt(
  profile: PersonalityProfile | null,
  entry: Entry
): { system: string; user: string } {
  const system = `You are a personality analyst for a journal app. Analyze the journal entry and return an updated personality profile as JSON.

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "emotions": {
    "patterns": ["string array of recurring emotional themes"],
    "recentMood": "single word mood",
    "moodHistory": [{"date": "YYYY-MM-DD", "mood": "word", "valence": -1.0 to 1.0}]
  },
  "bigFive": {
    "openness": 0-100,
    "conscientiousness": 0-100,
    "extraversion": 0-100,
    "agreeableness": 0-100,
    "neuroticism": 0-100
  },
  "writingStyle": {
    "formality": 0-100,
    "verbosity": 0-100,
    "topTopics": ["string array"],
    "vocabularyLevel": "conversational|academic|literary|technical"
  },
  "lastUpdated": "ISO timestamp",
  "entryCount": number
}`;

  let user: string;
  if (profile) {
    user = `Here is the user's current personality profile:
${JSON.stringify(profile, null, 2)}

Here is their new journal entry (${entry.date}):
---
${entry.content}
---

Update the profile to incorporate this new entry. Adjust Big Five scores gradually (max ±5 per entry). Add the new mood to moodHistory. Keep moodHistory to the most recent entries. Update patterns, topics, and writing style as needed. Increment entryCount by 1.`;
  } else {
    user = `This is the user's first journal entry (${entry.date}):
---
${entry.content}
---

Create an initial personality profile based on this single entry. Set entryCount to 1. Be conservative with Big Five scores (keep near 50 unless strong signals). Include one moodHistory entry for today.`;
  }

  return { system, user };
}

export function buildFullRecomputePrompt(
  entries: Entry[]
): { system: string; user: string } {
  const system = `You are a personality analyst for a journal app. Analyze ALL provided journal entries and build a comprehensive personality profile as JSON.

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
  "emotions": {
    "patterns": ["string array of recurring emotional themes"],
    "recentMood": "single word mood from most recent entry",
    "moodHistory": [{"date": "YYYY-MM-DD", "mood": "word", "valence": -1.0 to 1.0}]
  },
  "bigFive": {
    "openness": 0-100,
    "conscientiousness": 0-100,
    "extraversion": 0-100,
    "agreeableness": 0-100,
    "neuroticism": 0-100
  },
  "writingStyle": {
    "formality": 0-100,
    "verbosity": 0-100,
    "topTopics": ["string array"],
    "vocabularyLevel": "conversational|academic|literary|technical"
  },
  "lastUpdated": "ISO timestamp",
  "entryCount": number
}`;

  const entriesText = entries
    .map((e) => `[${e.date}]\n${e.content}`)
    .join('\n\n---\n\n');

  const user = `Here are ${entries.length} journal entries to analyze:

${entriesText}

Build a comprehensive personality profile from all entries. Include one moodHistory entry per journal entry (up to the most recent 90). Set entryCount to ${entries.length}.`;

  return { system, user };
}

export function buildCompanionSystemPrompt(
  profile: PersonalityProfile | null,
  settings: Settings
): string {
  if (!profile) {
    const name = settings.userName ? ` ${settings.userName}` : '';
    return `You are a warm, friendly AI companion in a journal app. The user${name} hasn't written enough entries yet for you to know them well. Be welcoming, curious, and encouraging. Ask about their day and interests. Keep responses concise and natural.`;
  }

  const { emotions, bigFive, writingStyle, entryCount } = profile;
  const name = settings.userName || 'the user';

  let depthInstruction: string;
  if (entryCount < 5) {
    depthInstruction = `You've only been through ${entryCount} entries together. Be warm but not presumptuous. You're still getting to know them. Ask questions to learn more.`;
  } else if (entryCount <= 20) {
    depthInstruction = `You've been through ${entryCount} entries together. You can reference patterns you've noticed. Be more personal and specific in your responses.`;
  } else {
    depthInstruction = `You've been through ${entryCount} entries together. You know them well. Be direct, use callbacks to recurring themes, and be a trusted friend. You can be playful or serious as the moment calls for.`;
  }

  return `You are a personal AI companion for a journal app. Here is what you know about ${name}:

WRITING STYLE: They write at formality level ${writingStyle.formality}/100 and verbosity ${writingStyle.verbosity}/100. Their vocabulary is ${writingStyle.vocabularyLevel}. Match this style in your responses.

EMOTIONAL STATE: Their recent mood is "${emotions.recentMood}". Recurring emotional themes: ${emotions.patterns.join(', ') || 'none identified yet'}. If they seem stressed or down, be calmer and more supportive. If they're energized, match that energy.

PERSONALITY: Openness ${bigFive.openness}/100, Conscientiousness ${bigFive.conscientiousness}/100, Extraversion ${bigFive.extraversion}/100, Agreeableness ${bigFive.agreeableness}/100, Neuroticism ${bigFive.neuroticism}/100.

TOPICS THEY CARE ABOUT: ${writingStyle.topTopics.join(', ') || 'still discovering'}. Reference these naturally when relevant.

RELATIONSHIP DEPTH: ${depthInstruction}

TASK DETECTION: When the user mentions something they need to do, buy, remember, or follow up on, include a JSON block at the very end of your response in this exact format:
[TODOS]
[{"text": "task description"}]
[/TODOS]
Only include this block when there are new actionable tasks. Do not include it if no tasks were mentioned. The block must be after your conversational response.

Keep responses concise and natural. Don't be overly formal or stiff. Never mention that you're analyzing their personality — just embody the adaptation naturally.`;
}
