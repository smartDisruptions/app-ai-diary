'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getSettings, saveSettings } from '@/lib/storage/settings';
import { exportEntriesJSON } from '@/lib/storage/entries';
import { getStorageUsage } from '@/lib/storage/quota';
import { useToast } from '@/contexts/ToastContext';

const MAX_STORAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(196,154,108,0.1)',
  borderRadius: '16px',
  padding: '18px',
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  color: 'rgba(200,184,164,0.3)',
  marginBottom: '12px',
};

export default function SettingsPage() {
  const { showToast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('anthropic/claude-sonnet-4');
  const [userName, setUserName] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    setApiKey(settings.apiKey);
    setModel(settings.model);
    setUserName(settings.userName);
    setStorageUsed(getStorageUsage());
  }, []);

  function handleSave() {
    saveSettings({ apiKey, model, userName });
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

  function handleReanalyze() {
    showToast('Coming soon', 'info');
  }

  function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith('diary-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    setApiKey('');
    setModel('anthropic/claude-sonnet-4');
    setUserName('');
    setStorageUsed(0);
    setConfirmClear(false);
    showToast('All data cleared', 'success');
  }

  const storagePercent = Math.min((storageUsed / MAX_STORAGE_BYTES) * 100, 100);
  const storageLabel = `${(storageUsed / 1024).toFixed(1)} KB / ${(MAX_STORAGE_BYTES / 1024 / 1024).toFixed(0)} MB`;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 800,
          color: '#c49a6c',
          margin: 0,
          marginBottom: '24px',
        }}
      >
        Settings
      </h1>

      <div className="flex flex-col gap-3">
        {/* API Configuration */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>API Configuration</div>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="apiKey"
                className="block mb-1"
                style={{ fontSize: '13px', color: 'rgba(200,184,164,0.6)' }}
              >
                API Key
              </label>
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
                  className="shrink-0 rounded-xl px-3 min-h-[44px] transition-colors duration-200 cursor-pointer"
                  style={{
                    fontSize: '13px',
                    color: '#c49a6c',
                    background: 'rgba(196,154,108,0.08)',
                    border: '1px solid rgba(196,154,108,0.15)',
                  }}
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="model"
                className="block mb-1"
                style={{ fontSize: '13px', color: 'rgba(200,184,164,0.6)' }}
              >
                Model
              </label>
              <Input
                id="model"
                name="model"
                placeholder="anthropic/claude-sonnet-4"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="userName"
                className="block mb-1"
                style={{ fontSize: '13px', color: 'rgba(200,184,164,0.6)' }}
              >
                User Name
              </label>
              <Input
                id="userName"
                name="userName"
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>

        {/* Storage */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>Storage</div>
          <div className="space-y-2">
            <div
              className="flex justify-between"
              style={{ fontSize: '13px', color: 'rgba(200,184,164,0.6)' }}
            >
              <span>Used</span>
              <span>{storageLabel}</span>
            </div>
            <div
              className="w-full h-[6px] rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${storagePercent}%`,
                  background: 'linear-gradient(to right, #a07850, #c49a6c)',
                }}
                role="progressbar"
                aria-valuenow={storagePercent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>Data Management</div>
          <div className="flex flex-col gap-3">
            <Button variant="ghost" onClick={handleExport} className="w-full">
              Export JSON
            </Button>
            <Button variant="ghost" onClick={handleReanalyze} className="w-full">
              Reanalyze All
            </Button>
            <div>
              <button
                type="button"
                onClick={handleClearAll}
                className="w-full rounded-xl font-semibold min-h-[44px] px-5 py-2.5 transition-colors duration-200 cursor-pointer"
                style={{
                  fontSize: '14px',
                  color: confirmClear ? '#fca5a5' : '#f87171',
                  background: confirmClear
                    ? 'rgba(239,68,68,0.15)'
                    : 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                {confirmClear ? 'Confirm Clear All Data' : 'Clear All Data'}
              </button>
              {confirmClear && (
                <p
                  className="mt-1"
                  style={{ fontSize: '12px', color: '#f87171' }}
                >
                  Click again to permanently delete all diary data. This cannot
                  be undone.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
