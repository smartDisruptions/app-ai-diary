export class APIError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class RateLimitError extends APIError {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export class AuthError extends APIError {
  constructor(message: string, status: number) {
    super(message, status);
    this.name = 'AuthError';
  }
}

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function chatCompletion(
  messages: ChatMessage[],
  model: string,
  apiKey: string
): Promise<string> {
  let response: Response;

  try {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Diary',
      },
      body: JSON.stringify({ model, messages }),
    });
  } catch (error) {
    throw new APIError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfterHeader = response.headers.get('retry-after');
      const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : 5;
      throw new RateLimitError('Rate limit exceeded', retryAfter);
    }

    if (response.status === 401 || response.status === 403) {
      throw new AuthError('Authentication failed', response.status);
    }

    throw new APIError(`API error: ${response.status}`, response.status);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
