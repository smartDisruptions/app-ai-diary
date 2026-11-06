import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsPage from '@/app/settings/page';

// Mock the toast context
const mockShowToast = vi.fn();
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

// Mock storage modules
vi.mock('@/lib/storage/settings', () => ({
  getSettings: vi.fn(() => ({
    apiKey: 'test-key-123',
    model: 'anthropic/claude-sonnet-4',
    userName: 'Alice',
  })),
  saveSettings: vi.fn(),
  DEFAULT_COMPANION_NAME: 'Ember',
}));

vi.mock('@/lib/storage/entries', () => ({
  exportEntriesJSON: vi.fn(() => '[]'),
}));

vi.mock('@/lib/storage/quota', () => ({
  getStorageUsage: vi.fn(() => 2048),
}));

import { saveSettings } from '@/lib/storage/settings';

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<SettingsPage />);

    expect(screen.getByLabelText(/api key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
  });

  it('loads existing settings from localStorage', () => {
    render(<SettingsPage />);

    expect(screen.getByLabelText(/api key/i)).toHaveValue('test-key-123');
    expect(screen.getByLabelText(/model/i)).toHaveValue('anthropic/claude-sonnet-4');
    expect(screen.getByLabelText(/your name/i)).toHaveValue('Alice');
  });

  it('saves settings on button click', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const saveButton = screen.getByRole('button', { name: /save settings/i });
    await user.click(saveButton);

    expect(saveSettings).toHaveBeenCalledWith({
      apiKey: 'test-key-123',
      model: 'anthropic/claude-sonnet-4',
      userName: 'Alice',
      companionName: 'Ember',
    });
    expect(mockShowToast).toHaveBeenCalledWith('Settings saved successfully', 'success');
  });

  it('lets the companion be renamed, and never saves a blank name', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const nameInput = screen.getByLabelText(/companion name/i);
    expect(nameInput).toHaveValue('Ember');

    await user.clear(nameInput);
    await user.type(nameInput, 'Wren');
    await user.click(screen.getByRole('button', { name: /save settings/i }));
    expect(saveSettings).toHaveBeenLastCalledWith(expect.objectContaining({ companionName: 'Wren' }));

    await user.clear(nameInput);
    await user.click(screen.getByRole('button', { name: /save settings/i }));
    expect(saveSettings).toHaveBeenLastCalledWith(expect.objectContaining({ companionName: 'Ember' }));
  });

  it('has an export button', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('button', { name: /export json/i })).toBeInTheDocument();
  });

  it('has a reanalyze button', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('button', { name: /reanalyze all/i })).toBeInTheDocument();
  });

  it('has a clear all data button', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('button', { name: /clear all data/i })).toBeInTheDocument();
  });

  it('shows storage usage bar', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/2\.0 KB/)).toBeInTheDocument();
  });

  it('toggles API key visibility', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const apiKeyInput = screen.getByLabelText(/api key/i);
    expect(apiKeyInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /show/i });
    await user.click(toggleButton);

    expect(apiKeyInput).toHaveAttribute('type', 'text');
  });
});
