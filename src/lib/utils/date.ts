import type { Entry } from '@/types';

/**
 * Returns today's date as YYYY-MM-DD in the local timezone.
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD date string into a readable format, e.g. "March 29, 2026".
 */
export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Returns "Today", "Yesterday", or a formatted date string.
 */
export function formatRelativeDate(dateStr: string): string {
  const today = getTodayString();

  if (dateStr === today) {
    return 'Today';
  }

  // Calculate yesterday
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (dateStr === yesterdayStr) {
    return 'Yesterday';
  }

  return formatDate(dateStr);
}

/**
 * Groups entries by month (e.g. "March 2026"), with entries sorted newest-first
 * within each group. The returned record preserves insertion order by most recent month first.
 */
export function groupEntriesByMonth(entries: Entry[]): Record<string, Entry[]> {
  // Sort all entries newest-first by date
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  const groups: Record<string, Entry[]> = {};

  for (const entry of sorted) {
    const [year, month] = entry.date.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(entry);
  }

  return groups;
}
