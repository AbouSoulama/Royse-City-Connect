import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('isDemoMode', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns false when VITE_DEMO_MODE=false', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'false');
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    const { isDemoMode } = await import('./config');
    expect(isDemoMode()).toBe(false);
  });

  it('returns true when VITE_DEMO_MODE=true', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'true');
    const { isDemoMode } = await import('./config');
    expect(isDemoMode()).toBe(true);
  });
});

describe('itemSharePath', () => {
  it('builds deep link paths', async () => {
    const { itemSharePath } = await import('./share');
    expect(itemSharePath('abc-123', 'post')).toBe('/posts/abc-123');
    expect(itemSharePath('abc-123', 'job')).toBe('/jobs/abc-123');
  });
});
