import { beforeAll, vi } from 'vitest';

// Mock Nuxt auto-imports globally
vi.mock('#imports', () => ({
  useSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(),
        })),
      })),
    })),
  })),
  useSupabaseUser: vi.fn(() => ({ value: null })),
  useSupabaseSession: vi.fn(() => ({ value: null })),
  $fetch: vi.fn(),
}));

// Mock Vue reactivity functions globally
vi.mock('vue', () => ({
  ref: (value: any) => ({ value }),
  computed: (fn: () => any) => ({ value: fn() }),
  watch: vi.fn(),
  onMounted: vi.fn(),
  onUnmounted: vi.fn(),
}));

// Global test setup for web application
beforeAll(async () => {
  // Setup any global test configuration here
  console.log('Setting up web test environment...');
});
