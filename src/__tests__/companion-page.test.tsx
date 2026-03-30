import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MessageBubble } from '@/components/companion/MessageBubble';
import { ChatInput } from '@/components/companion/ChatInput';
import { TypingIndicator } from '@/components/companion/TypingIndicator';
import { RapportLevel } from '@/components/companion/RapportLevel';
import type { Message } from '@/types';

describe('MessageBubble', () => {
  it('renders user message aligned right with copper border', () => {
    const msg: Message = {
      role: 'user',
      content: 'Hello there',
      timestamp: '2026-03-29T10:30:00Z',
    };
    const { container } = render(<MessageBubble message={msg} />);
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    // User messages should be right-aligned
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('justify-end');
  });

  it('renders assistant message aligned left', () => {
    const msg: Message = {
      role: 'assistant',
      content: 'Hi! How are you?',
      timestamp: '2026-03-29T10:31:00Z',
    };
    const { container } = render(<MessageBubble message={msg} />);
    expect(screen.getByText('Hi! How are you?')).toBeInTheDocument();
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('justify-start');
  });

  it('displays formatted timestamp', () => {
    const msg: Message = {
      role: 'user',
      content: 'Test',
      timestamp: '2026-03-29T10:30:00Z',
    };
    render(<MessageBubble message={msg} />);
    // Should show time in some locale format (exact format depends on locale)
    const timeEl = screen.getByText(/\d{1,2}:\d{2}\s?(AM|PM)/i);
    expect(timeEl).toBeInTheDocument();
  });
});

describe('ChatInput', () => {
  it('calls onSend on Enter key', async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByPlaceholderText('Type a message...');

    await userEvent.type(input, 'Hello world{Enter}');
    expect(onSend).toHaveBeenCalledWith('Hello world');
  });

  it('clears input after sending', async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement;

    await userEvent.type(input, 'Hello{Enter}');
    expect(input.value).toBe('');
  });

  it('does not send empty messages', async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByPlaceholderText('Type a message...');

    await userEvent.type(input, '{Enter}');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} disabled />);
    const input = screen.getByPlaceholderText('Type a message...');
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
  });
});

describe('TypingIndicator', () => {
  it('renders three bouncing dots', () => {
    const { container } = render(<TypingIndicator />);
    const dots = container.querySelectorAll('.typing-dot');
    expect(dots).toHaveLength(3);
  });

  it('is aligned left like assistant messages', () => {
    const { container } = render(<TypingIndicator />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('justify-start');
  });
});

describe('RapportLevel', () => {
  it('shows "Getting to know you" for fewer than 5 entries', () => {
    render(<RapportLevel entryCount={3} />);
    expect(screen.getByText(/Getting to know you/)).toBeInTheDocument();
  });

  it('shows "Building rapport" for 5-20 entries', () => {
    render(<RapportLevel entryCount={10} />);
    expect(screen.getByText(/Building rapport/)).toBeInTheDocument();
  });

  it('shows "Trusted companion" for more than 20 entries', () => {
    render(<RapportLevel entryCount={25} />);
    expect(screen.getByText(/Trusted companion/)).toBeInTheDocument();
  });
});
