import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRBAC } from '../../composables/useRBAC';

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
  useAuth: () => ({
    user: { value: { id: '1' } },
  }),
}));

describe('useRBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty permissions and loading state', () => {
    const { permissions, loading, userRole } = useRBAC();

    expect(permissions.value).toEqual([]);
    expect(loading.value).toBe(true);
    expect(userRole.value).toBeNull();
  });

  it('should check if user has specific permission', async () => {
    const mockPermissions = ['read:users', 'write:users', 'admin:all'];
    mockSupabaseClient
      .from()
      .select()
      .eq()
      .single.mockResolvedValue({
        data: { permissions: mockPermissions },
        error: null,
      });

    const { hasPermission, loadPermissions } = useRBAC();

    await loadPermissions();

    expect(hasPermission('read:users')).toBe(true);
    expect(hasPermission('write:users')).toBe(true);
    expect(hasPermission('admin:all')).toBe(true);
    expect(hasPermission('delete:users')).toBe(false);
  });

  it('should check if user has any of multiple permissions', async () => {
    const mockPermissions = ['read:users', 'write:users'];
    mockSupabaseClient
      .from()
      .select()
      .eq()
      .single.mockResolvedValue({
        data: { permissions: mockPermissions },
        error: null,
      });

    const { hasAnyPermission, loadPermissions } = useRBAC();

    await loadPermissions();

    expect(hasAnyPermission(['read:users', 'delete:users'])).toBe(true);
    expect(hasAnyPermission(['delete:users', 'admin:all'])).toBe(false);
  });

  it('should check if user has all permissions', async () => {
    const mockPermissions = ['read:users', 'write:users'];
    mockSupabaseClient
      .from()
      .select()
      .eq()
      .single.mockResolvedValue({
        data: { permissions: mockPermissions },
        error: null,
      });

    const { hasAllPermissions, loadPermissions } = useRBAC();

    await loadPermissions();

    expect(hasAllPermissions(['read:users', 'write:users'])).toBe(true);
    expect(hasAllPermissions(['read:users', 'delete:users'])).toBe(false);
  });

  it('should handle permission loading error', async () => {
    mockSupabaseClient
      .from()
      .select()
      .eq()
      .single.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied' },
      });

    const { loadPermissions, loading, error } = useRBAC();

    await loadPermissions();

    expect(loading.value).toBe(false);
    expect(error.value).toBe('Permission denied');
  });

  it('should check if user is admin', async () => {
    const mockPermissions = ['admin:all'];
    mockSupabaseClient
      .from()
      .select()
      .eq()
      .single.mockResolvedValue({
        data: { permissions: mockPermissions, role: 'admin' },
        error: null,
      });

    const { isAdmin, loadPermissions } = useRBAC();

    await loadPermissions();

    expect(isAdmin()).toBe(true);
  });

  it('should check if user is super admin', async () => {
    const mockPermissions = ['super_admin:all'];
    mockSupabaseClient
      .from()
      .select()
      .eq()
      .single.mockResolvedValue({
        data: { permissions: mockPermissions, role: 'super_admin' },
        error: null,
      });

    const { isSuperAdmin, loadPermissions } = useRBAC();

    await loadPermissions();

    expect(isSuperAdmin()).toBe(true);
  });
});
