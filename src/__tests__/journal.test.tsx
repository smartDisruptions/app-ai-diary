import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntryEditor } from '@/components/journal/EntryEditor';
import { EntryList } from '@/components/journal/EntryList';
import { EntryCard } from '@/components/journal/EntryCard';
import type { Entry } from '@/types';

// Mock date utils to avoid timezone-dependent test failures
vi.mock('@/lib/utils/date', () => ({
  getTodayString: () => '2026-03-29',
  formatDate: (d: string) => d,
  formatRelativeDate: (d: string) => d,
  groupEntriesByMonth: (entries: Entry[]) => {
    if (entries.length === 0) return {};
    return { 'March 2026': entries };
  },
}));

const makeEntry = (overrides: Partial<Entry> = {}): Entry => ({
  id: 'test-1',
  date: '2026-03-29',
  content: 'Today was a good day for writing tests and building things.',
  createdAt: '2026-03-29T10:00:00.000Z',
  updatedAt: '2026-03-29T10:00:00.000Z',
  ...overrides,
});

describe('EntryEditor', () => {
  it('renders textarea and save button when open', () => {
    render(<EntryEditor isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByPlaceholderText('Write about your day...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<EntryEditor isOpen={false} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('calls onSave with content and date', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EntryEditor isOpen={true} onClose={vi.fn()} onSave={onSave} />);

    const textarea = screen.getByPlaceholderText('Write about your day...');
    await user.type(textarea, 'Hello world');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith('Hello world', '2026-03-29');
  });

  it('clears textarea after save', async () => {
    const user = userEvent.setup();
    render(<EntryEditor isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);

    const textarea = screen.getByPlaceholderText('Write about your day...');
    await user.type(textarea, 'Some text');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(textarea).toHaveValue('');
  });

  it('shows Update and Cancel buttons when editing', () => {
    const entry = makeEntry();
    render(
      <EntryEditor isOpen={true} onClose={vi.fn()} onSave={vi.fn()} editingEntry={entry} />
    );
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});

describe('EntryList', () => {
  it('renders entries', () => {
    const entries = [makeEntry()];
    render(<EntryList entries={entries} onTapEntry={vi.fn()} />);
    expect(screen.getByText(/Today was a good day/)).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    render(<EntryList entries={[]} onTapEntry={vi.fn()} />);
    expect(screen.getByText('No entries yet. Start writing!')).toBeInTheDocument();
  });
});

describe('EntryCard', () => {
  it('shows content preview', () => {
    const entry = makeEntry();
    render(<EntryCard entry={entry} onTap={vi.fn()} />);
    expect(
      screen.getByText('Today was a good day for writing tests and building things.')
    ).toBeInTheDocument();
  });

  it('truncates long content to 100 chars', () => {
    const longContent = 'A'.repeat(200);
    const entry = makeEntry({ content: longContent });
    render(<EntryCard entry={entry} onTap={vi.fn()} />);
    expect(screen.getByText('A'.repeat(100) + '...')).toBeInTheDocument();
  });

  it('shows mood badge when provided', () => {
    const entry = makeEntry();
    render(<EntryCard entry={entry} mood="Happy" onTap={vi.fn()} />);
    expect(screen.getByText('Happy')).toBeInTheDocument();
  });
});
