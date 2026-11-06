import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Test</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('Button', () => {
  it('renders primary variant by default', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: 'Click me' });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('from-[#f4c578]');
  });

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole('button', { name: 'Ghost' });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('text-cream');
    expect(btn.className).not.toContain('from-[#f4c578]');
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('Badge', () => {
  it('renders solid variant by default', () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText('New');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('from-[#f4c578]');
  });

  it('renders outline variant', () => {
    render(<Badge variant="outline">Draft</Badge>);
    const badge = screen.getByText('Draft');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('border');
    expect(badge.className).not.toContain('from-[#f4c578]');
  });
});

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState title="No entries" description="Start writing your first entry.">
        <button>Create entry</button>
      </EmptyState>
    );
    expect(screen.getByText('No entries')).toBeInTheDocument();
    expect(screen.getByText('Start writing your first entry.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create entry' })).toBeInTheDocument();
  });

  it('renders icon slot', () => {
    render(
      <EmptyState icon={<span data-testid="icon">icon</span>} title="Empty" />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
