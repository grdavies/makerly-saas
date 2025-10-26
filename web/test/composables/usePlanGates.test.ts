import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePlanGates } from '../../composables/usePlanGates';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
  })),
};

// Mock Nuxt composables
vi.mock('#app', () => ({
  useSupabaseClient: () => mockSupabaseClient,
  useTeam: () => ({
    currentTeam: { value: { id: '1' } },
  }),
  $fetch: vi.fn(),
}));

vi.mock('#imports', () => ({
  useSupabaseClient: () => mockSupabaseClient,
}));

vi.mock('../../composables/useTeam', () => ({
  useTeam: () => ({
    currentTeam: { value: { id: '1', name: 'Test Team' } },
    loading: { value: false },
  }),
}));

vi.mock('../../composables/useUsageTracking', () => ({
  useUsageTracking: () => ({
    usage: { value: { api_calls: 100, storage_gb: 5 } },
    limits: { value: { api_calls: 1000, storage_gb: 10 } },
    loading: { value: false },
  }),
}));

describe('usePlanGates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty plan data and loading state', () => {
    const { planData, loading, error } = usePlanGates();

    expect(planData.value).toBeNull();
    expect(loading.value).toBe(true);
    expect(error.value).toBeNull();
  });

  it('should check if feature is accessible', async () => {
    const mockPlanData = {
      plan_id: 'starter',
      capabilities: [
        { capability: 'max_users', limit: 10, current_usage: 5 },
        { capability: 'api_calls', limit: 1000, current_usage: 200 },
      ],
    };

    mockSupabaseClient.from().select().eq().single.mockResolvedValue({
      data: mockPlanData,
      error: null,
    });

    const { canAccessFeature, loadPlanData } = usePlanGates();

    await loadPlanData();

    expect(canAccessFeature('max_users')).toBe(true);
    expect(canAccessFeature('api_calls')).toBe(true);
    expect(canAccessFeature('premium_feature')).toBe(false);
  });

  it('should check usage limits', async () => {
    const mockPlanData = {
      plan_id: 'starter',
      capabilities: [
        { capability: 'max_users', limit: 10, current_usage: 8 },
        { capability: 'api_calls', limit: 1000, current_usage: 950 },
      ],
    };

    mockSupabaseClient.from().select().eq().single.mockResolvedValue({
      data: mockPlanData,
      error: null,
    });

    const { checkUsage, loadPlanData } = usePlanGates();

    await loadPlanData();

    const usersUsage = checkUsage('max_users');
    expect(usersUsage.used).toBe(8);
    expect(usersUsage.limit).toBe(10);
    expect(usersUsage.remaining).toBe(2);
    expect(usersUsage.percentage).toBe(80);

    const apiUsage = checkUsage('api_calls');
    expect(apiUsage.used).toBe(950);
    expect(apiUsage.limit).toBe(1000);
    expect(apiUsage.remaining).toBe(50);
    expect(apiUsage.percentage).toBe(95);
  });

  it('should handle usage limit exceeded', async () => {
    const mockPlanData = {
      plan_id: 'starter',
      capabilities: [{ capability: 'max_users', limit: 10, current_usage: 10 }],
    };

    mockSupabaseClient.from().select().eq().single.mockResolvedValue({
      data: mockPlanData,
      error: null,
    });

    const { checkUsage, loadPlanData } = usePlanGates();

    await loadPlanData();

    const usage = checkUsage('max_users');
    expect(usage.exceeded).toBe(true);
    expect(usage.remaining).toBe(0);
  });

  it('should get plan details', async () => {
    const mockPlanData = {
      plan_id: 'starter',
      plan_name: 'Starter Plan',
      capabilities: [{ capability: 'max_users', limit: 10, current_usage: 5 }],
    };

    mockSupabaseClient.from().select().eq().single.mockResolvedValue({
      data: mockPlanData,
      error: null,
    });

    const { getPlanDetails, loadPlanData } = usePlanGates();

    await loadPlanData();

    const details = getPlanDetails();
    expect(details.plan_id).toBe('starter');
    expect(details.plan_name).toBe('Starter Plan');
    expect(details.capabilities).toHaveLength(1);
  });

  it('should handle grace window for exceeded limits', async () => {
    const mockPlanData = {
      plan_id: 'starter',
      capabilities: [{ capability: 'max_users', limit: 10, current_usage: 12 }],
      grace_windows: [
        {
          capability: 'max_users',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      ],
    };

    mockSupabaseClient.from().select().eq().single.mockResolvedValue({
      data: mockPlanData,
      error: null,
    });

    const { canAccessFeature, loadPlanData } = usePlanGates();

    await loadPlanData();

    expect(canAccessFeature('max_users')).toBe(true); // Should be true due to grace window
  });

  it('should handle plan data loading error', async () => {
    mockSupabaseClient
      .from()
      .select()
      .eq()
      .single.mockResolvedValue({
        data: null,
        error: { message: 'Failed to load plan data' },
      });

    const { loadPlanData, error } = usePlanGates();

    await loadPlanData();

    expect(error.value).toBe('Failed to load plan data');
  });

  it('should refresh plan data', async () => {
    const mockPlanData = {
      plan_id: 'starter',
      capabilities: [{ capability: 'max_users', limit: 10, current_usage: 5 }],
    };

    mockSupabaseClient.from().select().eq().single.mockResolvedValue({
      data: mockPlanData,
      error: null,
    });

    const { refreshPlanData, planData } = usePlanGates();

    await refreshPlanData();

    expect(planData.value).toEqual(mockPlanData);
  });

  it('should handle invalid capability names', () => {
    const { checkUsage } = usePlanGates();

    const usage = checkUsage('invalid_capability');
    expect(usage.used).toBe(0);
    expect(usage.limit).toBe(0);
    expect(usage.remaining).toBe(0);
    expect(usage.percentage).toBe(0);
  });

  it('should calculate upgrade suggestions', async () => {
    const mockPlanData = {
      plan_id: 'starter',
      capabilities: [{ capability: 'max_users', limit: 10, current_usage: 10 }],
    };

    mockSupabaseClient.from().select().eq().single.mockResolvedValue({
      data: mockPlanData,
      error: null,
    });

    const { getUpgradeSuggestions, loadPlanData } = usePlanGates();

    await loadPlanData();

    const suggestions = getUpgradeSuggestions();
    expect(suggestions).toContain('max_users');
  });
});
