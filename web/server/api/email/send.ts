import { z } from 'zod';
import { EmailService } from '~/server/utils/emailService';

const SendEmailSchema = z.object({
  type: z.enum(['welcome', 'password-reset', 'invitation', 'custom']),
  to: z.string().email(),
  data: z.record(z.any()),
});

const WelcomeEmailDataSchema = z.object({
  name: z.string(),
  loginUrl: z.string().url(),
});

const PasswordResetEmailDataSchema = z.object({
  name: z.string(),
  resetUrl: z.string().url(),
  expirationHours: z.number().min(1).max(24),
});

const InvitationEmailDataSchema = z.object({
  inviteeName: z.string(),
  inviterName: z.string(),
  teamName: z.string(),
  role: z.string(),
  invitationUrl: z.string().url(),
  expirationDays: z.number().min(1).max(30),
});

const CustomEmailDataSchema = z.object({
  subject: z.string(),
  html: z.string(),
  text: z.string().optional(),
  from: z.string().email().optional(),
});

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event);
    const { type, to, data } = SendEmailSchema.parse(body);

    let result;

    switch (type) {
      case 'welcome': {
        const emailData = WelcomeEmailDataSchema.parse(data);
        result = await EmailService.sendWelcomeEmail(emailData, to);
        break;
      }
      case 'password-reset': {
        const emailData = PasswordResetEmailDataSchema.parse(data);
        result = await EmailService.sendPasswordResetEmail(emailData, to);
        break;
      }
      case 'invitation': {
        const emailData = InvitationEmailDataSchema.parse(data);
        result = await EmailService.sendInvitationEmail(emailData, to);
        break;
      }
      case 'custom': {
        const emailData = CustomEmailDataSchema.parse(data);
        result = await EmailService.sendCustomEmail({
          to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          from: emailData.from,
        });
        break;
      }
      default:
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid email type',
        });
    }

    return {
      success: true,
      messageId: result.data?.id,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('Email sending error:', error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: error.errors,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send email',
    });
  }
});
