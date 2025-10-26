import { z } from 'zod';
import type { Database } from '@shared/types/supabase';

// Validation schemas
const CurrencyCodeSchema = z.enum([
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'CNY',
  'SEK',
  'NZD',
  'MXN',
  'SGD',
  'HKD',
  'NOK',
  'TRY',
  'RUB',
  'INR',
  'BRL',
  'ZAR',
  'KRW',
]);
const UnitFamilySchema = z.enum(['metric', 'imperial', 'custom']);
const DateFormatSchema = z.enum([
  'MM/DD/YYYY',
  'DD/MM/YYYY',
  'YYYY-MM-DD',
  'DD-MM-YYYY',
  'MM.DD.YYYY',
  'DD.MM.YYYY',
  'YYYY/MM/DD',
  'DD/MM/YY',
]);
const TimeFormatSchema = z.enum(['12h', '24h']);

const UserI18NPreferencesSchema = z.object({
  currency_code: CurrencyCodeSchema.optional(),
  unit_family: UnitFamilySchema.optional(),
  date_format: DateFormatSchema.optional(),
  time_format: TimeFormatSchema.optional(),
  timezone_id: z.string().uuid().optional(),
  number_format: z.string().optional(),
});

const TeamI18NPreferencesSchema = z.object({
  currency_code: CurrencyCodeSchema,
  unit_family: UnitFamilySchema,
  date_format: DateFormatSchema,
  time_format: TimeFormatSchema,
  timezone_id: z.string().uuid().optional(),
  number_format: z.string(),
});

// GET /api/i18n/user-preferences
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

  if (method === 'GET') {
    try {
      // Get user preferences
      const { data: userPrefs, error: userError } = await supabase
        .from('user_i18n_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // Get team preferences (from user's primary team)
      const { data: teamPrefs, error: teamError } = await supabase
        .from('team_i18n_preferences')
        .select(
          `
          *,
          teams!inner(
            id,
            name,
            team_members!inner(
              user_id,
              status
            )
          )
        `
        )
        .eq('teams.team_members.user_id', user.id)
        .eq('teams.team_members.status', 'active')
        .single();

      if (teamError && teamError.code !== 'PGRST116') {
        throw teamError;
      }

      // Calculate effective preferences
      const effective = {
        currency_code:
          userPrefs?.currency_code || teamPrefs?.currency_code || 'USD',
        unit_family:
          userPrefs?.unit_family || teamPrefs?.unit_family || 'metric',
        date_format:
          userPrefs?.date_format || teamPrefs?.date_format || 'MM/DD/YYYY',
        time_format: userPrefs?.time_format || teamPrefs?.time_format || '12h',
        timezone_id: userPrefs?.timezone_id || teamPrefs?.timezone_id,
        number_format:
          userPrefs?.number_format || teamPrefs?.number_format || 'en-US',
      };

      return {
        user_preferences: userPrefs,
        team_preferences: teamPrefs,
        effective_preferences: effective,
      };
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch user preferences',
        data: error,
      });
    }
  }

  if (method === 'PUT') {
    try {
      const body = await readBody(event);
      const validatedData = UserI18NPreferencesSchema.parse(body);

      const { data, error } = await supabase
        .from('user_i18n_preferences')
        .upsert({
          user_id: user.id,
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

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
        statusCode: 500,
        statusMessage: 'Failed to update user preferences',
        data: error,
      });
    }
  }

  if (method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('user_i18n_preferences')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      return {
        success: true,
        message: 'User preferences reset to team defaults',
      };
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to reset user preferences',
        data: error,
      });
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed',
  });
});
