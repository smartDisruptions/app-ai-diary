'use client';

import { useCallback, useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import type { Message } from '@/types';
import { getMessages, addMessage, clearMessages } from '@/lib/storage/companion';
import { getProfile } from '@/lib/storage/profile';
import { getSettings } from '@/lib/storage/settings';
import { addTodo } from '@/lib/storage/todos';
import { sendCompanionMessage } from '@/lib/ai/companion';
import { AuthError, RateLimitError } from '@/lib/api/openrouter';

function extractTodos(response: string): { cleanResponse: string; todos: string[] } {
  const todoMatch = response.match(/\[TODOS\]\s*([\s\S]*?)\s*\[\/TODOS\]/);
  if (!todoMatch) return { cleanResponse: response, todos: [] };

  const cleanResponse = response.replace(/\[TODOS\][\s\S]*?\[\/TODOS\]/, '').trim();
  try {
    const parsed = JSON.parse(todoMatch[1]);
    const todos = Array.isArray(parsed) ? parsed.map((t: { text: string }) => t.text) : [];
    return { cleanResponse, todos };
  } catch {
    return { cleanResponse, todos: [] };
  }
}

export function useChat() {
  // Loaded after mount: the page is prerendered, and reading storage during the
  // first render made the server and browser disagree (a hydration error).
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    setMessages(getMessages());
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const settings = getSettings();
    if (!settings.apiKey) {
      setError('Configure your API key in Settings to chat.');
      return;
    }

    const userMsg: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    const updatedAfterUser = getMessages();
    setMessages(updatedAfterUser);

    setLoading(true);
    setError(null);

    try {
      const profile = getProfile();
      const response = await sendCompanionMessage(updatedAfterUser, profile, settings);

      const { cleanResponse, todos } = extractTodos(response);

      // Save any extracted todos
      for (const text of todos) {
        addTodo({
          id: nanoid(),
          text,
          done: false,
          source: 'From chat',
          createdAt: new Date().toISOString(),
        });
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: cleanResponse,
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMsg);
      setMessages(getMessages());
    } catch (e) {
      if (e instanceof AuthError) {
        setError('Invalid API key. Please check your settings.');
      } else if (e instanceof RateLimitError) {
        setError('Rate limited. Please wait a moment and try again.');
      } else {
        setError(e instanceof Error ? e.message : 'Failed to send message');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    clearMessages();
    setMessages([]);
    setError(null);
  }, []);

  const refresh = useCallback(() => {
    setMessages(getMessages());
  }, []);

  return { messages, loading, error, sendMessage, clear, refresh };
}
