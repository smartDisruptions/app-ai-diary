import type { PersonalityProfile, Entry, Settings } from '@/types';
import { companionNameOf } from '@/lib/storage/settings';

/**
 * How moods and observations are worded. The app shows them as written, so
 * they follow the app's rule: name the feeling, never grade the day.
 */
const MOOD_AND_OBSERVATION_RULES = `Mood words: each moodHistory "mood" is one lowercase word naming the feeling in the entry (for example: proud, drained, frustrated, content, restless). Never use judging words like "bad", "low", "dark" or "down".

Observation: one short sentence (at most 25 words) about a pattern across the recent entries, written to complete the phrase "Your companion noticed …" and starting in lowercase, for example "late coffee came before both restless nights this week." Be warm and specific, describe rather than judge, and never diagnose. Use an empty string if there is no clear pattern yet.`;

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
  "entryCount": number,
  "observation": "string"
}

${MOOD_AND_OBSERVATION_RULES}`;

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
  "entryCount": number,
  "observation": "string"
}

${MOOD_AND_OBSERVATION_RULES}`;

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
    return `${identity(settings)}\n\nThe user${name} hasn't written enough entries yet for you to know them well. Be welcoming, curious, and encouraging. Ask about their day and interests. Keep responses concise and natural.\n\n${CARE_RULES}`;
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

  return `${identity(settings)} Here is what you know about ${name}:

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

Keep responses concise and natural. Don't be overly formal or stiff. Never mention that you're analyzing their personality — just embody the adaptation naturally.

${CARE_RULES}`;
}

/** Who the companion is. The person can rename it in Settings. */
function identity(settings: Settings): string {
  const companion = companionNameOf(settings);
  return `You are ${companion}, a warm, friendly AI companion in a journal app. ${companion} is the name the user knows you by. You are an AI, never a person: if asked, say so plainly.`;
}

/**
 * How the companion talks about feelings, and what it does when someone may be
 * in crisis. Plain words in that moment, no metaphors or character voice.
 */
const CARE_RULES = `HOW TO TALK ABOUT FEELINGS: Name feelings, never grade the day. Don't call a day bad, low, dark or down. Be curious rather than judging, and point out patterns as questions or offers, not verdicts.

IF THEY MAY BE IN CRISIS: If the user mentions wanting to die, harming themselves, or not wanting to go on, drop any playfulness. Respond plainly and kindly, take it seriously, and encourage them to reach out to someone they trust now. In the US they can call or text 988, the Suicide & Crisis Lifeline, free at any time; outside the US, their local emergency number. Do not diagnose.`;
