import { z } from 'zod';
import { EmailService } from '~/server/utils/emailService';

const PasswordResetEmailSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  resetUrl: z.string().url(),
  expirationHours: z.number().min(1).max(24),
});

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event);
    const { email, name, resetUrl, expirationHours } =
      PasswordResetEmailSchema.parse(body);

    const result = await EmailService.sendPasswordResetEmail(
      { name, resetUrl, expirationHours },
      email
    );

    return {
      success: true,
      messageId: result.data?.id,
      message: 'Password reset email sent successfully',
    };
  } catch (error) {
    console.error('Password reset email error:', error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: error.errors,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send password reset email',
    });
  }
});
