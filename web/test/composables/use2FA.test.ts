import { describe, it, expect, vi, beforeEach } from 'vitest';
import { use2FA } from '../../composables/use2FA';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(),
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
  useAuth: () => ({
    user: { value: { id: '1' } },
  }),
}));

describe('use2FA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with disabled 2FA and loading state', () => {
    const { isEnabled, loading, qrCode } = use2FA();

    expect(isEnabled.value).toBe(false);
    expect(loading.value).toBe(true);
    expect(qrCode.value).toBeNull();
  });

  it('should generate QR code for 2FA setup', async () => {
    const mockSecret = 'JBSWY3DPEHPK3PXP';
    const mockQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';

    mockSupabaseClient
      .from()
      .insert()
      .select.mockResolvedValue({
        data: { secret: mockSecret, qr_code: mockQRCode },
        error: null,
      });

    const { generateQRCode, qrCode, secret } = use2FA();

    const result = await generateQRCode();

    expect(result.success).toBe(true);
    expect(qrCode.value).toBe(mockQRCode);
    expect(secret.value).toBe(mockSecret);
    expect(mockSupabaseClient.from().insert().select).toHaveBeenCalled();
  });

  it('should verify 2FA token', async () => {
    const mockToken = '123456';

    mockSupabaseClient
      .from()
      .select()
      .eq()
      .single.mockResolvedValue({
        data: { secret: 'JBSWY3DPEHPK3PXP' },
        error: null,
      });

    const { verifyToken } = use2FA();

    const result = await verifyToken(mockToken);

    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
  });

  it('should handle invalid 2FA token', async () => {
    const mockToken = '000000';

    mockSupabaseClient
      .from()
      .select()
      .eq()
      .single.mockResolvedValue({
        data: { secret: 'JBSWY3DPEHPK3PXP' },
        error: null,
      });

    const { verifyToken } = use2FA();

    const result = await verifyToken(mockToken);

    expect(result.success).toBe(true);
    expect(result.valid).toBe(false);
  });

  it('should enable 2FA after verification', async () => {
    const mockToken = '123456';

    mockSupabaseClient
      .from()
      .select()
      .eq()
      .single.mockResolvedValue({
        data: { secret: 'JBSWY3DPEHPK3PXP' },
        error: null,
      });

    mockSupabaseClient
      .from()
      .update()
      .eq()
      .select.mockResolvedValue({
        data: { two_factor_enabled: true },
        error: null,
      });

    const { enable2FA, isEnabled } = use2FA();

    const result = await enable2FA(mockToken);

    expect(result.success).toBe(true);
    expect(isEnabled.value).toBe(true);
  });

  it('should disable 2FA', async () => {
    mockSupabaseClient
      .from()
      .update()
      .eq()
      .select.mockResolvedValue({
        data: { two_factor_enabled: false },
        error: null,
      });

    const { disable2FA, isEnabled } = use2FA();

    const result = await disable2FA();

    expect(result.success).toBe(true);
    expect(isEnabled.value).toBe(false);
  });

  it('should handle 2FA setup error', async () => {
    mockSupabaseClient
      .from()
      .insert()
      .select.mockResolvedValue({
        data: null,
        error: { message: 'Failed to generate secret' },
      });

    const { generateQRCode, error } = use2FA();

    const result = await generateQRCode();

    expect(result.success).toBe(false);
    expect(error.value).toBe('Failed to generate secret');
  });

  it('should validate token format', async () => {
    const { verifyToken } = use2FA();

    const result = await verifyToken('12345'); // Invalid length

    expect(result.success).toBe(false);
    expect(result.error).toContain('Token must be 6 digits');
  });
});
