import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BigFiveChart } from '@/components/profile/BigFiveChart';
import { WritingStyleCard } from '@/components/profile/WritingStyleCard';
import { EmotionPatterns } from '@/components/profile/EmotionPatterns';
import type { BigFive, WritingStyle, EmotionData } from '@/types';

// Mock getProfile for the page test
vi.mock('@/lib/storage/profile', () => ({
  getProfile: vi.fn(() => null),
  PROFILE_KEY: 'diary-profile',
  PROFILE_EVENT: 'diary-profile-changed',
}));

vi.mock('@/lib/storage/entries', () => ({
  getEntries: vi.fn(() => []),
}));

describe('ProfilePage empty state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no profile', async () => {
    const { getProfile } = await import('@/lib/storage/profile');
    vi.mocked(getProfile).mockReturnValue(null);

    const { default: ProfilePage } = await import('@/app/profile/page');
    render(<ProfilePage />);

    // An honest empty state, never the made-up sample profile the page once showed.
    expect(screen.getByText('No patterns yet')).toBeInTheDocument();
    expect(screen.getByText('Your patterns show up here once you’ve written a few entries.')).toBeInTheDocument();
    expect(screen.queryByText('Openness')).not.toBeInTheDocument();
  });
});

describe('BigFiveChart', () => {
  const bigFive: BigFive = {
    openness: 75,
    conscientiousness: 60,
    extraversion: 45,
    agreeableness: 80,
    neuroticism: 30,
  };

  it('renders all 5 traits', () => {
    render(<BigFiveChart bigFive={bigFive} />);
    // Friendly names on the jars, never a grade-sounding label like "Neuroticism".
    for (const name of ['Curious', 'Organized', 'Outgoing', 'Warm', 'Sensitive']) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.queryByText('Neuroticism')).not.toBeInTheDocument();
    // The research names stay available to screen readers.
    expect(screen.getByRole('listitem', { name: /Openness/ })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /Conscientiousness/ })).toBeInTheDocument();
  });

  it('renders scores for each trait', () => {
    render(<BigFiveChart bigFive={bigFive} />);
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });
});

describe('WritingStyleCard', () => {
  const writingStyle: WritingStyle = {
    formality: 65,
    verbosity: 40,
    topTopics: ['work', 'relationships', 'health'],
    vocabularyLevel: 'Advanced',
  };

  it('renders formality and verbosity meters', () => {
    render(<WritingStyleCard writingStyle={writingStyle} />);
    expect(screen.getByText('Casual')).toBeInTheDocument();
    expect(screen.getByText('Formal')).toBeInTheDocument();
    expect(screen.getByText('Concise')).toBeInTheDocument();
    expect(screen.getByText('Verbose')).toBeInTheDocument();
  });

  it('does not render topics or vocabulary (moved to profile page)', () => {
    render(<WritingStyleCard writingStyle={writingStyle} />);
    // WritingStyleCard now only renders formality/verbosity bars
    expect(screen.queryByText('work')).not.toBeInTheDocument();
    expect(screen.queryByText('Advanced')).not.toBeInTheDocument();
  });
});

describe('EmotionPatterns', () => {
  const emotions: EmotionData = {
    patterns: ['anxiety', 'gratitude', 'determination'],
    recentMood: 'Hopeful',
    moodHistory: [],
  };

  it('renders recent mood', () => {
    render(<EmotionPatterns emotions={emotions} />);
    expect(screen.getByText('Hopeful')).toBeInTheDocument();
  });

  it('renders badges for patterns', () => {
    render(<EmotionPatterns emotions={emotions} />);
    expect(screen.getByText('anxiety')).toBeInTheDocument();
    expect(screen.getByText('gratitude')).toBeInTheDocument();
    expect(screen.getByText('determination')).toBeInTheDocument();
  });
});
