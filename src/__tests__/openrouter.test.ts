import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  chatCompletion,
  APIError,
  RateLimitError,
  AuthError,
} from '../lib/api/openrouter';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

const messages = [{ role: 'user' as const, content: 'Hello' }];
const model = 'openai/gpt-4';
const apiKey = 'test-key';

function mockResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {}
) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    json: async () => body,
  };
}

describe('chatCompletion', () => {
  it('returns content on successful completion', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({
        choices: [{ message: { content: 'Hi there!' } }],
      })
    );

    const result = await chatCompletion(messages, model, apiKey);
    expect(result).toBe('Hi there!');
  });

  it('sends correct headers and body', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({
        choices: [{ message: { content: 'ok' } }],
      })
    );

    await chatCompletion(messages, model, apiKey);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-key',
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AI Diary',
        },
        body: JSON.stringify({ model, messages }),
      }
    );
  });

  it('throws RateLimitError with retryAfter on 429', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ error: 'rate limited' }, 429, { 'retry-after': '10' })
    );

    await expect(chatCompletion(messages, model, apiKey)).rejects.toThrow(
      RateLimitError
    );

    try {
      await chatCompletion(messages, model, apiKey);
    } catch (error) {
      // second call needs its own mock
    }

    // Re-test to verify retryAfter value
    mockFetch.mockResolvedValueOnce(
      mockResponse({ error: 'rate limited' }, 429, { 'retry-after': '10' })
    );

    try {
      await chatCompletion(messages, model, apiKey);
    } catch (error) {
      expect(error).toBeInstanceOf(RateLimitError);
      expect((error as RateLimitError).retryAfter).toBe(10);
      expect((error as RateLimitError).status).toBe(429);
    }
  });

  it('defaults retryAfter to 5 when header is missing', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ error: 'rate limited' }, 429)
    );

    try {
      await chatCompletion(messages, model, apiKey);
    } catch (error) {
      expect(error).toBeInstanceOf(RateLimitError);
      expect((error as RateLimitError).retryAfter).toBe(5);
    }
  });

  it('throws AuthError on 401', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ error: 'unauthorized' }, 401)
    );

    await expect(chatCompletion(messages, model, apiKey)).rejects.toThrow(
      AuthError
    );
  });

  it('throws AuthError on 403', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ error: 'forbidden' }, 403)
    );

    await expect(chatCompletion(messages, model, apiKey)).rejects.toThrow(
      AuthError
    );
  });

  it('throws APIError on other error status codes', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ error: 'server error' }, 500)
    );

    await expect(chatCompletion(messages, model, apiKey)).rejects.toThrow(
      APIError
    );

    mockFetch.mockResolvedValueOnce(
      mockResponse({ error: 'server error' }, 500)
    );

    try {
      await chatCompletion(messages, model, apiKey);
    } catch (error) {
      expect((error as APIError).status).toBe(500);
    }
  });

  it('throws APIError on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    await expect(chatCompletion(messages, model, apiKey)).rejects.toThrow(
      APIError
    );

    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    try {
      await chatCompletion(messages, model, apiKey);
    } catch (error) {
      expect(error).toBeInstanceOf(APIError);
      expect((error as APIError).message).toBe('Failed to fetch');
      expect((error as APIError).status).toBe(0);
    }
  });
});
