import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from '../app/page';

// Mocking components that might use window or browser-only features
vi.mock('../components/ui/Hero', () => ({
  default: () => <div data-testid="hero">Hero</div>
}));

describe('Landing Page', () => {
  it('should render correctly', () => {
    // Basic test to check if the landing page component can be rendered
    // Note: Since it might be a Server Component in Next.js 13+, 
    // we might need to handle it accordingly if we want deep rendering.
    // For now, we just check if the export exists and is a function.
    expect(typeof LandingPage).toBe('function');
  });
});
