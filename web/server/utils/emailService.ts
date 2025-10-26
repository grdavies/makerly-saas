import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  text?: string;
}

export interface WelcomeEmailData {
  name: string;
  loginUrl: string;
}

export interface PasswordResetEmailData {
  name: string;
  resetUrl: string;
  expirationHours: number;
}

export interface InvitationEmailData {
  inviteeName: string;
  inviterName: string;
  teamName: string;
  role: string;
  invitationUrl: string;
  expirationDays: number;
}

export class EmailService {
  private static readonly FROM_EMAIL = 'noreply@makerly.com';
  private static readonly FROM_NAME = 'Makerly';

  static async sendWelcomeEmail(data: WelcomeEmailData, to: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px;">
          <img src="https://makerly.com/logo.png" alt="Makerly Logo" style="width: 120px; height: 40px;">
        </div>
        
        <div style="padding: 20px;">
          <h1 style="color: #333;">Welcome to Makerly!</h1>
          <p>Hi ${data.name},</p>
          <p>Welcome to Makerly! We're excited to have you on board. Your account has been successfully created and you're ready to start managing your inventory.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.loginUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Get Started</a>
          </div>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
          
          <p>Best regards,<br>The Makerly Team</p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
          © 2024 Makerly. All rights reserved.
        </div>
      </div>
    `;

    return await resend.emails.send({
      from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
      to,
      subject: 'Welcome to Makerly!',
      html,
    });
  }

  static async sendPasswordResetEmail(
    data: PasswordResetEmailData,
    to: string
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px;">
          <img src="https://makerly.com/logo.png" alt="Makerly Logo" style="width: 120px; height: 40px;">
        </div>
        
        <div style="padding: 20px;">
          <h1 style="color: #333;">Reset Your Password</h1>
          <p>Hi ${data.name},</p>
          <p>We received a request to reset your password for your Makerly account. If you didn't make this request, you can safely ignore this email.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          
          <p>This link will expire in ${data.expirationHours} hours for security reasons.</p>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${data.resetUrl}</p>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>The Makerly Team</p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
          © 2024 Makerly. All rights reserved.
        </div>
      </div>
    `;

    return await resend.emails.send({
      from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
      to,
      subject: 'Reset Your Password - Makerly',
      html,
    });
  }

  static async sendInvitationEmail(data: InvitationEmailData, to: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px;">
          <img src="https://makerly.com/logo.png" alt="Makerly Logo" style="width: 120px; height: 40px;">
        </div>
        
        <div style="padding: 20px;">
          <h1 style="color: #333;">You're Invited!</h1>
          <p>Hi ${data.inviteeName},</p>
          <p><strong>${data.inviterName}</strong> has invited you to join the <strong>${data.teamName}</strong> team on Makerly.</p>
          
          <p>Makerly is a powerful inventory management platform that helps teams track, organize, and manage their inventory efficiently.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.invitationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a>
          </div>
          
          <p>Your role will be: <strong>${data.role}</strong></p>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${data.invitationUrl}</p>
          
          <p>This invitation will expire in ${data.expirationDays} days.</p>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>The Makerly Team</p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
          © 2024 Makerly. All rights reserved.
        </div>
      </div>
    `;

    return await resend.emails.send({
      from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
      to,
      subject: `You're Invited to Join ${data.teamName} on Makerly`,
      html,
    });
  }

  static async sendCustomEmail(options: EmailOptions) {
    return await resend.emails.send({
      from: options.from || `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}
