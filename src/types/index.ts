export type Entry = {
  id: string;
  date: string; // YYYY-MM-DD local timezone
  content: string;
  createdAt: string; // ISO timestamp
  updatedAt: string;
};

export type MoodPoint = {
  date: string;
  mood: string;
  valence: number; // -1 to 1
};

export type EmotionData = {
  patterns: string[];
  recentMood: string;
  moodHistory: MoodPoint[];
};

export type BigFive = {
  openness: number; // 0-100
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

export type WritingStyle = {
  formality: number; // 0-100
  verbosity: number; // 0-100
  topTopics: string[];
  vocabularyLevel: string;
};

export type PersonalityProfile = {
  emotions: EmotionData;
  bigFive: BigFive;
  writingStyle: WritingStyle;
  lastUpdated: string;
  entryCount: number;
};

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type Settings = {
  apiKey: string;
  model: string;
  userName: string;
};

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  source: string; // e.g. "From chat"
  createdAt: string; // ISO timestamp
};
