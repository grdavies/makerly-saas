import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCurrencyFormatting } from '../../composables/useCurrencyFormatting';

// Mock Supabase client
const mockSupabaseClient = {
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
};

// Mock Nuxt composables
vi.mock('#app', () => ({
  useSupabaseClient: () => mockSupabaseClient,
  useTeam: () => ({
    currentTeam: { value: { id: '1' } },
  }),
}));

vi.mock('#imports', () => ({
  useSupabaseClient: () => mockSupabaseClient,
}));

vi.mock('#i18n', () => ({
  useI18n: () => ({
    locale: { value: 'en' },
    t: (key: string) => key,
  }),
}));

vi.mock('../../composables/useAuth', () => ({
  useAuth: () => ({
    user: { value: { id: '1', email: 'test@example.com' } },
    session: { value: { access_token: 'token' } },
    loading: { value: false },
  }),
}));

vi.mock('../../composables/useTeam', () => ({
  useTeam: () => ({
    currentTeam: { value: { id: '1', name: 'Test Team' } },
    loading: { value: false },
  }),
}));

vi.mock('../../composables/useI18n', () => ({
  useI18n: () => ({
    userPreferences: { value: null },
    teamPreferences: { value: null },
    effectivePreferences: { value: null },
    loading: { value: false },
    loadPreferences: vi.fn(),
    updatePreferences: vi.fn(),
  }),
}));

describe('useCurrencyFormatting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default currency settings', () => {
    const { currency, symbol, precision, loading } = useCurrencyFormatting();

    expect(currency.value).toBe('USD');
    expect(symbol.value).toBe('$');
    expect(precision.value).toBe(2);
    expect(loading.value).toBe(true);
  });

  it('should format currency with default settings', () => {
    const { formatCurrency } = useCurrencyFormatting();

    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('should format currency with custom precision', () => {
    const { formatCurrency } = useCurrencyFormatting();

    expect(formatCurrency(1234.567, 3)).toBe('$1,234.567');
    expect(formatCurrency(1234.567, 0)).toBe('$1,235');
  });

  it('should format currency with different currencies', () => {
    const { formatCurrency } = useCurrencyFormatting();

    // Mock different currency settings
    const { currency, symbol } = useCurrencyFormatting();
    currency.value = 'EUR';
    symbol.value = '€';

    expect(formatCurrency(1234.56)).toBe('€1,234.56');
  });

  it('should handle negative amounts', () => {
    const { formatCurrency } = useCurrencyFormatting();

    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    expect(formatCurrency(-0.01)).toBe('-$0.01');
  });

  it('should handle zero amounts', () => {
    const { formatCurrency } = useCurrencyFormatting();

    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(0.0)).toBe('$0.00');
  });

  it('should handle very large numbers', () => {
    const { formatCurrency } = useCurrencyFormatting();

    expect(formatCurrency(999999999.99)).toBe('$999,999,999.99');
    expect(formatCurrency(1000000000)).toBe('$1,000,000,000.00');
  });

  it('should load team currency preferences', async () => {
    const mockPreferences = {
      currency_code: 'EUR',
      currency_symbol: '€',
      currency_precision: 2,
    };

    mockSupabaseClient.from().select().eq().single.mockResolvedValue({
      data: mockPreferences,
      error: null,
    });

    const { loadPreferences, currency, symbol, precision } =
      useCurrencyFormatting();

    await loadPreferences();

    expect(currency.value).toBe('EUR');
    expect(symbol.value).toBe('€');
    expect(precision.value).toBe(2);
  });

  it('should handle currency preference loading error', async () => {
    mockSupabaseClient
      .from()
      .select()
      .eq()
      .single.mockResolvedValue({
        data: null,
        error: { message: 'Failed to load preferences' },
      });

    const { loadPreferences, error } = useCurrencyFormatting();

    await loadPreferences();

    expect(error.value).toBe('Failed to load preferences');
  });

  it('should update currency preferences', async () => {
    mockSupabaseClient
      .from()
      .update()
      .eq()
      .select.mockResolvedValue({
        data: { currency_code: 'GBP' },
        error: null,
      });

    const { updatePreferences } = useCurrencyFormatting();

    const result = await updatePreferences({
      currency_code: 'GBP',
      currency_symbol: '£',
      currency_precision: 2,
    });

    expect(result.success).toBe(true);
  });

  it('should validate currency code format', () => {
    const { updatePreferences } = useCurrencyFormatting();

    const result = updatePreferences({
      currency_code: 'INVALID',
      currency_symbol: 'X',
      currency_precision: 2,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid currency code');
  });
});
