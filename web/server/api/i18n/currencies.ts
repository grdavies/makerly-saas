import type { Database } from '@shared/types/supabase';

// GET /api/i18n/currencies
export default defineEventHandler(async event => {
  const method = getMethod(event);

  if (method !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed',
    });
  }

  const supabase = await serverSupabaseClient<Database>(event);

  try {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return {
      currencies: data || [],
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch currencies',
      data: error,
    });
  }
});
