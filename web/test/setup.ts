import { beforeAll, vi } from 'vitest';

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
