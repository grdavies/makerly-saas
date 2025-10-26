import { z } from 'zod';
import type { Database } from '@shared/types/supabase';

type UsageWindowType = Database['public']['Enums']['usage_window_type'];

// Validation schemas
const TrackUsageSchema = z.object({
  capability_key: z.string().min(1),
  value: z.number().int().min(1).default(1),
  window_type: z
    .enum(['daily', 'weekly', 'monthly', 'yearly'])
    .default('monthly'),
  metadata: z.record(z.any()).optional(),
});

const GetUsageSchema = z.object({
  capability_key: z.string().min(1),
  window_type: z
    .enum(['daily', 'weekly', 'monthly', 'yearly'])
    .default('monthly'),
});

// POST /api/usage/track
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
  const query = getQuery(event);
  const teamId = query.team_id as string;

  if (!teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team ID is required',
    });
  }

  // Check if user has access to the team
  const { data: teamMember, error: memberError } = await supabase
    .from('team_members')
    .select('id, status')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (memberError || !teamMember) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied',
    });
  }

  if (method === 'POST') {
    try {
      const body = await readBody(event);
      const validatedData = TrackUsageSchema.parse(body);

      // Calculate window boundaries
      const { windowStart, windowEnd } = calculateWindowBoundaries(
        validatedData.window_type
      );

      // Check if record already exists for this window
      const { data: existingRecord } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('team_id', teamId)
        .eq('capability_key', validatedData.capability_key)
        .eq('window_type', validatedData.window_type)
        .eq('window_start', windowStart.toISOString())
        .single();

      let result;
      if (existingRecord) {
        // Update existing record
        const { data, error: updateError } = await supabase
          .from('usage_tracking')
          .update({
            usage_value: existingRecord.usage_value + validatedData.value,
            recorded_at: new Date().toISOString(),
            metadata: { ...existingRecord.metadata, ...validatedData.metadata },
          })
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = data;
      } else {
        // Create new record
        const { data, error: insertError } = await supabase
          .from('usage_tracking')
          .insert({
            team_id: teamId,
            capability_key: validatedData.capability_key,
            usage_value: validatedData.value,
            window_type: validatedData.window_type,
            window_start: windowStart.toISOString(),
            window_end: windowEnd.toISOString(),
            metadata: validatedData.metadata || {},
          })
          .select()
          .single();

        if (insertError) throw insertError;
        result = data;
      }

      return {
        success: true,
        data: result,
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
        statusCode: 500,
        statusMessage: 'Failed to track usage',
        data: error,
      });
    }
  }

  if (method === 'GET') {
    try {
      const validatedQuery = GetUsageSchema.parse(query);

      const { data, error: fetchError } = await supabase.rpc('get_team_usage', {
        team_uuid: teamId,
        capability_key: validatedQuery.capability_key,
        window_type: validatedQuery.window_type,
      });

      if (fetchError) throw fetchError;

      return {
        capability_key: validatedQuery.capability_key,
        window_type: validatedQuery.window_type,
        usage: data || 0,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid query parameters',
          data: error.errors,
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to get usage',
        data: error,
      });
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed',
  });
});

// Helper function to calculate window boundaries
function calculateWindowBoundaries(windowType: UsageWindowType) {
  const now = new Date();
  let windowStart: Date;
  let windowEnd: Date;

  switch (windowType) {
    case 'daily':
      windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      windowEnd = new Date(windowStart.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      const dayOfWeek = now.getDay();
      windowStart = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
      windowStart.setHours(0, 0, 0, 0);
      windowEnd = new Date(windowStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      windowStart = new Date(now.getFullYear(), now.getMonth(), 1);
      windowEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case 'yearly':
      windowStart = new Date(now.getFullYear(), 0, 1);
      windowEnd = new Date(now.getFullYear() + 1, 0, 1);
      break;
    default:
      windowStart = new Date(now.getFullYear(), now.getMonth(), 1);
      windowEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  return { windowStart, windowEnd };
}
