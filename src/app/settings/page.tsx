'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmberMark } from '@/components/stream/EmberMark';
import { DEFAULT_COMPANION_NAME, getSettings, saveSettings } from '@/lib/storage/settings';
import { exportEntriesJSON } from '@/lib/storage/entries';
import { getStorageUsage } from '@/lib/storage/quota';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useToast } from '@/contexts/ToastContext';

const MAX_STORAGE_BYTES = 5 * 1024 * 1024; // 5 MB

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[13.5px] font-semibold text-cream">
        {label}
      </label>
      {children}
      {hint && <p className="text-[12.5px] leading-relaxed text-[var(--cream-soft)]">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { showToast } = useToast();
  const { triggerFullRecompute, analyzing } = useAnalysis();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('anthropic/claude-sonnet-4');
  const [userName, setUserName] = useState('');
  const [companionName, setCompanionName] = useState(DEFAULT_COMPANION_NAME);
  const [showApiKey, setShowApiKey] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    setApiKey(settings.apiKey);
    setModel(settings.model);
    setUserName(settings.userName);
    setCompanionName(settings.companionName || DEFAULT_COMPANION_NAME);
    setStorageUsed(getStorageUsage());
  }, []);

  function handleSave() {
    saveSettings({
      apiKey,
      model,
      userName,
      companionName: companionName.trim() || DEFAULT_COMPANION_NAME,
    });
    showToast('Settings saved successfully', 'success');
  }

  function handleExport() {
    const json = exportEntriesJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-diary-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Diary entries exported', 'success');
  }

  async function handleReanalyze() {
    if (!apiKey) {
      showToast('Add an AI key first', 'info');
      return;
    }
    showToast('Rereading all your entries…', 'info');
    await triggerFullRecompute();
    showToast('Patterns updated', 'success');
  }

  function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith('diary-')) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    setApiKey('');
    setModel('anthropic/claude-sonnet-4');
    setUserName('');
    setCompanionName(DEFAULT_COMPANION_NAME);
    setStorageUsed(0);
    setConfirmClear(false);
    showToast('All data cleared', 'success');
  }

  const storagePercent = Math.min((storageUsed / MAX_STORAGE_BYTES) * 100, 100);
  const storageLabel = `${(storageUsed / 1024).toFixed(1)} KB / ${(MAX_STORAGE_BYTES / 1024 / 1024).toFixed(0)} MB`;
  const shownName = companionName.trim() || DEFAULT_COMPANION_NAME;

  return (
    <div className="mx-auto grid max-w-2xl gap-5 px-5 pt-[calc(28px+env(safe-area-inset-top,0px))] md:px-8 md:pt-12 pb-tabbar">
      <h1 className="display text-[40px]">Settings</h1>

      <section className="panel grid gap-4 p-5" aria-labelledby="s-companion">
        <div className="flex items-center gap-3">
          <EmberMark size={36} blink />
          <div>
            <h2 id="s-companion" className="section-label">
              Your companion
            </h2>
            <p className="mt-0.5 text-[13px] text-[var(--cream-soft)]">An AI that reads your entries and chats with you.</p>
          </div>
        </div>
        <Field id="companionName" label="Companion name" hint={`Call it anything you like. It will sign its notes as ${shownName}.`}>
          <Input
            id="companionName"
            name="companionName"
            placeholder={DEFAULT_COMPANION_NAME}
            value={companionName}
            onChange={(e) => setCompanionName(e.target.value)}
          />
        </Field>
      </section>

      <section className="panel grid gap-4 p-5" aria-labelledby="s-ai">
        <h2 id="s-ai" className="section-label">
          AI
        </h2>
        <Field
          id="apiKey"
          label="API key"
          hint="An OpenRouter key. It stays on this phone, and is only sent to OpenRouter with your requests."
        >
          <div className="flex gap-2">
            <Input
              id="apiKey"
              name="apiKey"
              type={showApiKey ? 'text' : 'password'}
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="min-h-[44px] shrink-0 rounded-xl border border-[rgba(244,230,204,0.14)] bg-[rgba(244,230,204,0.05)] px-3 text-[13px] font-semibold text-cream cursor-pointer"
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </Field>
        <Field
          id="model"
          label="Model"
          hint={`When a key is set, each entry is sent to this model so ${shownName} can read its mood. Entries are saved on this phone.`}
        >
          <Input id="model" name="model" placeholder="anthropic/claude-sonnet-4" value={model} onChange={(e) => setModel(e.target.value)} />
        </Field>
      </section>

      <section className="panel grid gap-4 p-5" aria-labelledby="s-you">
        <h2 id="s-you" className="section-label">
          You
        </h2>
        <Field id="userName" label="Your name" hint={`What ${shownName} calls you.`}>
          <Input id="userName" name="userName" placeholder="Your name" value={userName} onChange={(e) => setUserName(e.target.value)} />
        </Field>
      </section>

      <Button onClick={handleSave} className="w-full">
        Save settings
      </Button>

      <section className="panel grid gap-2 p-5" aria-labelledby="s-storage">
        <h2 id="s-storage" className="section-label">
          Storage on this phone
        </h2>
        <div className="flex justify-between text-[13px] text-[var(--cream-soft)]">
          <span>Used</span>
          <span className="tabular-nums">{storageLabel}</span>
        </div>
        <div className="h-[6px] w-full overflow-hidden rounded-full bg-[rgba(244,230,204,0.07)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${storagePercent}%`, background: 'linear-gradient(to right, #e19a3f, #f2b55e)' }}
            role="progressbar"
            aria-label="Storage used"
            aria-valuenow={storagePercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </section>

      <section className="panel grid gap-3 p-5" aria-labelledby="s-data">
        <h2 id="s-data" className="section-label">
          Your data
        </h2>
        <Button variant="ghost" onClick={handleExport} className="w-full">
          Export JSON
        </Button>
        <Button variant="ghost" onClick={handleReanalyze} className="w-full" disabled={analyzing}>
          {analyzing ? 'Rereading…' : 'Reanalyze all'}
        </Button>
        <div>
          <button
            type="button"
            onClick={handleClearAll}
            className="min-h-[44px] w-full rounded-xl px-5 py-2.5 text-[14px] font-semibold transition-colors duration-200 cursor-pointer"
            style={{
              color: confirmClear ? '#ffd0c7' : '#ffb4a6',
              background: confirmClear ? 'rgba(255,140,120,0.16)' : 'rgba(255,140,120,0.08)',
              border: '1px solid rgba(255,140,120,0.3)',
            }}
          >
            {confirmClear ? 'Confirm: clear all data' : 'Clear all data'}
          </button>
          {confirmClear && (
            <p className="mt-2 text-[12.5px] text-[#ffb4a6]">
              Tap again to delete every entry, chat and setting on this phone. This can’t be undone.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
