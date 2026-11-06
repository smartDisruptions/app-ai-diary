import { describe, it, expect, beforeEach } from 'vitest';
import { getSettings, saveSettings } from '@/lib/storage/settings';

beforeEach(() => {
  window.localStorage.clear();
});

describe('settings flow', () => {
  it('returns defaults when no settings saved', () => {
    const settings = getSettings();
    expect(settings.apiKey).toBe('');
    expect(settings.model).toBe('anthropic/claude-sonnet-4');
    expect(settings.userName).toBe('');
  });

  it('saves and retrieves API key', () => {
    saveSettings({ apiKey: 'sk-or-test-key', model: 'anthropic/claude-sonnet-4', userName: 'Josh', companionName: 'Ember' });
    const settings = getSettings();
    expect(settings.apiKey).toBe('sk-or-test-key');
    expect(settings.userName).toBe('Josh');
  });

  it('updated settings are used in subsequent reads', () => {
    saveSettings({ apiKey: 'key-1', model: 'model-1', userName: 'User1', companionName: 'Ember' });
    expect(getSettings().apiKey).toBe('key-1');

    saveSettings({ apiKey: 'key-2', model: 'model-2', userName: 'User2', companionName: 'Ember' });
    expect(getSettings().apiKey).toBe('key-2');
    expect(getSettings().model).toBe('model-2');
  });
});
