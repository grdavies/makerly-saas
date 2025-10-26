import { z } from 'zod';
import type { Database } from '@shared/types/supabase';

// Validation schemas
const ReactivateSubscriptionSchema = z.object({
  team_id: z.string().uuid(),
  subscription_id: z.string().uuid(),
});

// POST /api/billing/reactivate
export default defineEventHandler(async event => {
  const method = getMethod(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const supabase = await serverSupabaseClient<Database>(event);

  if (method === 'POST') {
    try {
      const body = await readBody(event);
      const validatedData = ReactivateSubscriptionSchema.parse(body);

      // Verify user has access to the team
      const { data: teamMember, error: memberError } = await supabase
        .from('team_members')
        .select(
          `
          id,
          status,
          roles!inner(
            name
          )
        `
        )
        .eq('team_id', validatedData.team_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (memberError || !teamMember) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied',
        });
      }

      const isAdmin =
        teamMember.roles.name === 'admin' ||
        teamMember.roles.name === 'super_admin';
      if (!isAdmin) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Admin access required',
        });
      }

      // Get subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('team_subscriptions')
        .select('*')
        .eq('id', validatedData.subscription_id)
        .eq('team_id', validatedData.team_id)
        .single();

      if (subscriptionError || !subscription) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Subscription not found',
        });
      }

      // Reactivate subscription in Planship
      await reactivatePlanshipSubscription(
        subscription.planship_subscription_id
      );

      // Update subscription in database
      const { error: updateError } = await supabase
        .from('team_subscriptions')
        .update({
          status: 'active',
          canceled_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validatedData.subscription_id);

      if (updateError) throw updateError;

      // Record plan change history
      await supabase.from('plan_change_history').insert({
        team_id: validatedData.team_id,
        from_plan_id: null,
        to_plan_id: subscription.plan_id,
        change_type: 'reactivate',
        change_reason: 'Subscription reactivated',
        created_by: user.id,
      });

      return {
        success: true,
        message: 'Subscription reactivated successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid request data',
          data: error.errors,
        });
      }

      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage:
          error.statusMessage || 'Failed to reactivate subscription',
        data: error,
      });
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed',
  });
});

// Planship integration function
async function reactivatePlanshipSubscription(
  subscriptionId: string
): Promise<void> {
  // This would integrate with Planship API
  // For now, just log the action
  console.log('Reactivating Planship subscription:', subscriptionId);
}
