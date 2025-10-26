import type { Database } from '@shared/types/supabase';

// GET /api/i18n/unit-families
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
    const { data: families, error: familiesError } = await supabase
      .from('unit_families')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (familiesError) throw familiesError;

    // Get units for each family
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (unitsError) throw unitsError;

    // Group units by family
    const familiesWithUnits =
      families?.map(family => ({
        ...family,
        units: units?.filter(unit => unit.family_id === family.id) || [],
      })) || [];

    return {
      unit_families: familiesWithUnits,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch unit families',
      data: error,
    });
  }
});
