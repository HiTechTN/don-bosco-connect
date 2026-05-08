import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('shows loading spinner', () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole('button');
    expect(button.getAttribute('disabled')).not.toBeNull();
  });
});

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByText('Test')).toBeDefined();
  });

  it('renders with success variant', () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText('OK')).toBeDefined();
  });
});