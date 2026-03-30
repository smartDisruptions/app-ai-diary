'use client';

import React, { useEffect, useState } from 'react';
import type { PersonalityProfile } from '@/types';
import { getProfile } from '@/lib/storage/profile';
import { getEntries } from '@/lib/storage/entries';
import { EmptyState } from '@/components/ui/EmptyState';
import { BigFiveChart } from '@/components/profile/BigFiveChart';
import { MoodTimeline } from '@/components/profile/MoodTimeline';
import { WritingStyleCard } from '@/components/profile/WritingStyleCard';
import { EmotionPatterns } from '@/components/profile/EmotionPatterns';

const defaultProfile: PersonalityProfile = {
  emotions: {
    patterns: ['Calm', 'Reflective', 'Curious'],
    recentMood: 'Neutral',
    moodHistory: [
      { date: '2026-03-24', mood: 'calm', valence: 0.2 },
      { date: '2026-03-25', mood: 'neutral', valence: 0.0 },
      { date: '2026-03-26', mood: 'curious', valence: 0.3 },
      { date: '2026-03-27', mood: 'reflective', valence: 0.1 },
      { date: '2026-03-28', mood: 'content', valence: 0.25 },
      { date: '2026-03-29', mood: 'neutral', valence: 0.0 },
      { date: '2026-03-30', mood: 'calm', valence: 0.15 },
    ],
  },
  bigFive: {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  },
  writingStyle: {
    formality: 50,
    verbosity: 50,
    topTopics: ['Getting started'],
    vocabularyLevel: 'conversational',
  },
  lastUpdated: new Date().toISOString(),
  entryCount: 0,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  color: 'rgba(200,184,164,0.3)',
  marginBottom: '12px',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(196,154,108,0.1)',
  borderRadius: '16px',
  padding: '18px',
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [entryCount, setEntryCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getProfile();
    setProfile(stored ?? defaultProfile);
    setEntryCount(getEntries().length);
    setLoaded(true);
  }, []);

  if (!loaded || !profile) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#c49a6c',
            margin: 0,
          }}
        >
          Your Insights
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: 'rgba(200,184,164,0.5)',
            marginTop: '4px',
          }}
        >
          {entryCount === 0
            ? 'Write journal entries to personalize your insights'
            : `Based on ${entryCount} journal ${entryCount === 1 ? 'entry' : 'entries'}`}
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {/* Personality */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>Personality</div>
          <BigFiveChart bigFive={profile.bigFive} />
        </div>

        {/* Mood over time */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>Mood over time</div>
          <MoodTimeline moodHistory={profile.emotions.moodHistory} />
        </div>

        {/* Writing style */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>Writing style</div>
          <WritingStyleCard writingStyle={profile.writingStyle} />
        </div>

        {/* What you write about */}
        {profile.writingStyle.topTopics.length > 0 && (
          <div style={cardStyle}>
            <div style={sectionLabelStyle}>What you write about</div>
            <div className="flex flex-wrap gap-2">
              {profile.writingStyle.topTopics.map((topic, i) => {
                const colors = [
                  { bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.25)', text: '#2dd4bf' },
                  { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', text: '#818cf8' },
                  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#fbbf24' },
                  { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)', text: '#f472b6' },
                  { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', text: '#a78bfa' },
                ];
                const c = colors[i % colors.length];
                return (
                  <span
                    key={topic}
                    className="rounded-full px-3.5 py-1.5"
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: c.text,
                      border: `1px solid ${c.border}`,
                      background: c.bg,
                    }}
                  >
                    {topic}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Emotional patterns */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>Emotional patterns</div>
          <EmotionPatterns emotions={profile.emotions} />
        </div>
      </div>
    </div>
  );
}
