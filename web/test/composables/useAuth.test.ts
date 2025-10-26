import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../../composables/useAuth';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
};

// Mock Nuxt composables
vi.mock('#app', () => ({
  useSupabaseClient: () => mockSupabaseClient,
  navigateTo: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null user and loading state', () => {
    const { user, loading } = useAuth();

    expect(user.value).toBeNull();
    expect(loading.value).toBe(true);
  });

  it('should handle successful login', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { login, user, loading } = useAuth();

    const result = await login('test@example.com', 'password');

    expect(result.success).toBe(true);
    expect(user.value).toEqual(mockUser);
    expect(loading.value).toBe(false);
    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('should handle login failure', async () => {
    const mockError = { message: 'Invalid credentials' };
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: mockError,
    });

    const { login, user, loading } = useAuth();

    const result = await login('test@example.com', 'wrongpassword');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
    expect(user.value).toBeNull();
    expect(loading.value).toBe(false);
  });

  it('should handle successful signup', async () => {
    const mockUser = { id: '1', email: 'new@example.com' };
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { signup, user, loading } = useAuth();

    const result = await signup('new@example.com', 'password');

    expect(result.success).toBe(true);
    expect(user.value).toEqual(mockUser);
    expect(loading.value).toBe(false);
  });

  it('should handle logout', async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: null,
    });

    const { logout, user, loading } = useAuth();

    await logout();

    expect(user.value).toBeNull();
    expect(loading.value).toBe(false);
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    const { login } = useAuth();

    const result = await login('invalid-email', 'password');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid email format');
  });

  it('should validate password length', async () => {
    const { login } = useAuth();

    const result = await login('test@example.com', '123');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Password must be at least 6 characters');
  });
});
