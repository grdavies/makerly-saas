import { z } from 'zod';
import { EmailService } from '~/server/utils/emailService';

const WelcomeEmailSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  loginUrl: z.string().url(),
});

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event);
    const { email, name, loginUrl } = WelcomeEmailSchema.parse(body);

    const result = await EmailService.sendWelcomeEmail(
      { name, loginUrl },
      email
    );

    return {
      success: true,
      messageId: result.data?.id,
      message: 'Welcome email sent successfully',
    };
  } catch (error) {
    console.error('Welcome email error:', error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: error.errors,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send welcome email',
    });
  }
});
