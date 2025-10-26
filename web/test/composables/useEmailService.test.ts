import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEmailService } from '../../composables/useEmailService';

// Mock Nuxt composables
const mockFetch = vi.fn();
vi.mock('#app', () => ({
  $fetch: mockFetch,
}));

describe('useEmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send welcome email successfully', async () => {
    const mockResponse = {
      success: true,
      messageId: 'msg_123',
      message: 'Welcome email sent successfully',
    };

    mockFetch.mockResolvedValue(mockResponse);

    const { sendWelcomeEmail } = useEmailService();

    const result = await sendWelcomeEmail({
      email: 'test@example.com',
      name: 'John Doe',
      loginUrl: 'https://app.makerly.com/login',
    });

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/email/welcome', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        name: 'John Doe',
        loginUrl: 'https://app.makerly.com/login',
      },
    });
  });

  it('should send password reset email successfully', async () => {
    const mockResponse = {
      success: true,
      messageId: 'msg_456',
      message: 'Password reset email sent successfully',
    };

    mockFetch.mockResolvedValue(mockResponse);

    const { sendPasswordResetEmail } = useEmailService();

    const result = await sendPasswordResetEmail({
      email: 'test@example.com',
      name: 'John Doe',
      resetUrl: 'https://app.makerly.com/reset?token=abc123',
      expirationHours: 24,
    });

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/email/password-reset', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        name: 'John Doe',
        resetUrl: 'https://app.makerly.com/reset?token=abc123',
        expirationHours: 24,
      },
    });
  });

  it('should send invitation email successfully', async () => {
    const mockResponse = {
      success: true,
      messageId: 'msg_789',
      message: 'Invitation email sent successfully',
    };

    mockFetch.mockResolvedValue(mockResponse);

    const { sendInvitationEmail } = useEmailService();

    const result = await sendInvitationEmail({
      email: 'newuser@example.com',
      inviteeName: 'Jane Smith',
      inviterName: 'John Doe',
      teamName: 'Acme Corp',
      role: 'member',
      invitationUrl: 'https://app.makerly.com/invite?token=xyz789',
      expirationDays: 7,
    });

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/email/invitation', {
      method: 'POST',
      body: {
        email: 'newuser@example.com',
        inviteeName: 'Jane Smith',
        inviterName: 'John Doe',
        teamName: 'Acme Corp',
        role: 'member',
        invitationUrl: 'https://app.makerly.com/invite?token=xyz789',
        expirationDays: 7,
      },
    });
  });

  it('should send custom email successfully', async () => {
    const mockResponse = {
      success: true,
      messageId: 'msg_custom',
      message: 'Email sent successfully',
    };

    mockFetch.mockResolvedValue(mockResponse);

    const { sendCustomEmail } = useEmailService();

    const result = await sendCustomEmail({
      email: 'test@example.com',
      subject: 'Custom Subject',
      html: '<h1>Custom HTML</h1>',
      text: 'Custom Text',
      from: 'custom@makerly.com',
    });

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/email/send', {
      method: 'POST',
      body: {
        type: 'custom',
        to: 'test@example.com',
        data: {
          subject: 'Custom Subject',
          html: '<h1>Custom HTML</h1>',
          text: 'Custom Text',
          from: 'custom@makerly.com',
        },
      },
    });
  });

  it('should handle email sending errors', async () => {
    const mockError = {
      success: false,
      message: 'Failed to send email',
    };

    mockFetch.mockResolvedValue(mockError);

    const { sendWelcomeEmail } = useEmailService();

    const result = await sendWelcomeEmail({
      email: 'test@example.com',
      name: 'John Doe',
      loginUrl: 'https://app.makerly.com/login',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Failed to send email');
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { sendWelcomeEmail } = useEmailService();

    await expect(
      sendWelcomeEmail({
        email: 'test@example.com',
        name: 'John Doe',
        loginUrl: 'https://app.makerly.com/login',
      })
    ).rejects.toThrow('Network error');
  });

  it('should validate email format', async () => {
    const { sendWelcomeEmail } = useEmailService();

    await expect(
      sendWelcomeEmail({
        email: 'invalid-email',
        name: 'John Doe',
        loginUrl: 'https://app.makerly.com/login',
      })
    ).rejects.toThrow();
  });

  it('should validate required fields', async () => {
    const { sendWelcomeEmail } = useEmailService();

    await expect(
      sendWelcomeEmail({
        email: '',
        name: 'John Doe',
        loginUrl: 'https://app.makerly.com/login',
      })
    ).rejects.toThrow();
  });

  it('should handle custom email without optional fields', async () => {
    const mockResponse = {
      success: true,
      messageId: 'msg_custom',
      message: 'Email sent successfully',
    };

    mockFetch.mockResolvedValue(mockResponse);

    const { sendCustomEmail } = useEmailService();

    const result = await sendCustomEmail({
      email: 'test@example.com',
      subject: 'Custom Subject',
      html: '<h1>Custom HTML</h1>',
    });

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith('/api/email/send', {
      method: 'POST',
      body: {
        type: 'custom',
        to: 'test@example.com',
        data: {
          subject: 'Custom Subject',
          html: '<h1>Custom HTML</h1>',
          text: undefined,
          from: undefined,
        },
      },
    });
  });
});
