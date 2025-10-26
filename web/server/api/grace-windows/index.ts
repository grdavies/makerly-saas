import { z } from 'zod';
import type { Database } from '@shared/types/supabase';

type GraceWindowStatus = Database['public']['Enums']['grace_window_status'];

// Validation schemas
const CreateGraceWindowSchema = z.object({
  capability_key: z.string().min(1),
  grace_period_days: z.number().int().min(1).max(30).default(7),
  grace_limit: z.number().int().min(0).default(0),
});

const UseGraceWindowSchema = z.object({
  grace_window_id: z.string().uuid(),
});

// POST /api/grace-windows
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

  // Check if user has admin access to the team
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

  const isAdmin =
    teamMember.roles.name === 'admin' ||
    teamMember.roles.name === 'super_admin';

  if (method === 'POST') {
    if (!isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required',
      });
    }

    try {
      const body = await readBody(event);
      const validatedData = CreateGraceWindowSchema.parse(body);

      // Check if there's already an active grace window for this capability
      const { data: existingGraceWindow } = await supabase
        .from('grace_windows')
        .select('id')
        .eq('team_id', teamId)
        .eq('capability_key', validatedData.capability_key)
        .eq('status', 'active')
        .single();

      if (existingGraceWindow) {
        throw createError({
          statusCode: 409,
          statusMessage:
            'Active grace window already exists for this capability',
        });
      }

      const startedAt = new Date();
      const expiresAt = new Date(
        startedAt.getTime() +
          validatedData.grace_period_days * 24 * 60 * 60 * 1000
      );

      const { data, error: insertError } = await supabase
        .from('grace_windows')
        .insert({
          team_id: teamId,
          capability_key: validatedData.capability_key,
          grace_limit: validatedData.grace_limit,
          grace_period_days: validatedData.grace_period_days,
          status: 'active',
          started_at: startedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return {
        success: true,
        data,
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
        statusMessage: error.statusMessage || 'Failed to create grace window',
        data: error,
      });
    }
  }

  if (method === 'GET') {
    try {
      const { data, error: fetchError } = await supabase
        .from('grace_windows')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return {
        grace_windows: data || [],
      };
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch grace windows',
        data: error,
      });
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed',
  });
});

// PUT /api/grace-windows/use
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

  if (method === 'PUT') {
    try {
      const body = await readBody(event);
      const validatedData = UseGraceWindowSchema.parse(body);

      // Get the grace window and verify team access
      const { data: graceWindow, error: fetchError } = await supabase
        .from('grace_windows')
        .select(
          `
          *,
          teams!inner(
            id,
            team_members!inner(
              user_id,
              status,
              roles!inner(
                name
              )
            )
          )
        `
        )
        .eq('id', validatedData.grace_window_id)
        .eq('teams.team_members.user_id', user.id)
        .eq('teams.team_members.status', 'active')
        .single();

      if (fetchError || !graceWindow) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Grace window not found',
        });
      }

      // Check if grace window is still active and not expired
      const now = new Date();
      const expiresAt = new Date(graceWindow.expires_at);

      if (graceWindow.status !== 'active') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Grace window is not active',
        });
      }

      if (now > expiresAt) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Grace window has expired',
        });
      }

      // Mark grace window as used
      const { data, error: updateError } = await supabase
        .from('grace_windows')
        .update({
          status: 'used',
          used_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', validatedData.grace_window_id)
        .select()
        .single();

      if (updateError) throw updateError;

      return {
        success: true,
        data,
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
        statusMessage: error.statusMessage || 'Failed to use grace window',
        data: error,
      });
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed',
  });
});
