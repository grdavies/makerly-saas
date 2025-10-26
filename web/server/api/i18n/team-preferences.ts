import { z } from 'zod'
import type { Database } from '@shared/types/supabase'

// Validation schemas
const CurrencyCodeSchema = z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'TRY', 'RUB', 'INR', 'BRL', 'ZAR', 'KRW'])
const UnitFamilySchema = z.enum(['metric', 'imperial', 'custom'])
const DateFormatSchema = z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MM.DD.YYYY', 'DD.MM.YYYY', 'YYYY/MM/DD', 'DD/MM/YY'])
const TimeFormatSchema = z.enum(['12h', '24h'])

const TeamI18NPreferencesSchema = z.object({
  currency_code: CurrencyCodeSchema,
  unit_family: UnitFamilySchema,
  date_format: DateFormatSchema,
  time_format: TimeFormatSchema,
  timezone_id: z.string().uuid().optional(),
  number_format: z.string()
})

// GET /api/i18n/team-preferences
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const supabase = await serverSupabaseClient<Database>(event)
  const query = getQuery(event)
  const teamId = query.team_id as string

  if (!teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team ID is required'
    })
  }

  // Check if user has admin access to the team
  const { data: teamMember, error: memberError } = await supabase
    .from('team_members')
    .select(`
      id,
      status,
      roles!inner(
        name
      )
    `)
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (memberError || !teamMember) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied'
    })
  }

  const isAdmin = teamMember.roles.name === 'admin' || teamMember.roles.name === 'super_admin'

  if (method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('team_i18n_preferences')
        .select('*')
        .eq('team_id', teamId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return {
        preferences: data,
        can_edit: isAdmin
      }
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch team preferences',
        data: error
      })
    }
  }

  if (method === 'PUT') {
    if (!isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }

    try {
      const body = await readBody(event)
      const validatedData = TeamI18NPreferencesSchema.parse(body)

      const { data, error } = await supabase
        .from('team_i18n_preferences')
        .upsert({
          team_id: teamId,
          ...validatedData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid request data',
          data: error.errors
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update team preferences',
        data: error
      })
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})
