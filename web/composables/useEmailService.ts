export interface EmailResponse {
  success: boolean;
  messageId?: string;
  message: string;
}

export interface WelcomeEmailData {
  email: string;
  name: string;
  loginUrl: string;
}

export interface PasswordResetEmailData {
  email: string;
  name: string;
  resetUrl: string;
  expirationHours: number;
}

export interface InvitationEmailData {
  email: string;
  inviteeName: string;
  inviterName: string;
  teamName: string;
  role: string;
  invitationUrl: string;
  expirationDays: number;
}

export interface CustomEmailData {
  email: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export const useEmailService = () => {
  const sendWelcomeEmail = async (
    data: WelcomeEmailData
  ): Promise<EmailResponse> => {
    const response = await $fetch<EmailResponse>('/api/email/welcome', {
      method: 'POST',
      body: data,
    });
    return response;
  };

  const sendPasswordResetEmail = async (
    data: PasswordResetEmailData
  ): Promise<EmailResponse> => {
    const response = await $fetch<EmailResponse>('/api/email/password-reset', {
      method: 'POST',
      body: data,
    });
    return response;
  };

  const sendInvitationEmail = async (
    data: InvitationEmailData
  ): Promise<EmailResponse> => {
    const response = await $fetch<EmailResponse>('/api/email/invitation', {
      method: 'POST',
      body: data,
    });
    return response;
  };

  const sendCustomEmail = async (
    data: CustomEmailData
  ): Promise<EmailResponse> => {
    const response = await $fetch<EmailResponse>('/api/email/send', {
      method: 'POST',
      body: {
        type: 'custom',
        to: data.email,
        data: {
          subject: data.subject,
          html: data.html,
          text: data.text,
          from: data.from,
        },
      },
    });
    return response;
  };

  return {
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendInvitationEmail,
    sendCustomEmail,
  };
};
