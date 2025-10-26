import { z } from 'zod';
import { EmailService } from '~/server/utils/emailService';

const InvitationEmailSchema = z.object({
  email: z.string().email(),
  inviteeName: z.string(),
  inviterName: z.string(),
  teamName: z.string(),
  role: z.string(),
  invitationUrl: z.string().url(),
  expirationDays: z.number().min(1).max(30),
});

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event);
    const {
      email,
      inviteeName,
      inviterName,
      teamName,
      role,
      invitationUrl,
      expirationDays,
    } = InvitationEmailSchema.parse(body);

    const result = await EmailService.sendInvitationEmail(
      {
        inviteeName,
        inviterName,
        teamName,
        role,
        invitationUrl,
        expirationDays,
      },
      email
    );

    return {
      success: true,
      messageId: result.data?.id,
      message: 'Invitation email sent successfully',
    };
  } catch (error) {
    console.error('Invitation email error:', error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: error.errors,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send invitation email',
    });
  }
});
