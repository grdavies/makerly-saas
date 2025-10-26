import { useI18n } from './useI18n'
import { useSupabaseClient } from '#imports'
import type { Database } from '@shared/types/supabase'

type DateFormat = Database['public']['Enums']['date_format']
type TimeFormat = Database['public']['Enums']['time_format']

interface Timezone {
  id: string
  name: string
  utc_offset: string
  is_dst: boolean
  is_active: boolean
}

interface DateTimeFormatOptions {
  dateFormat?: DateFormat
  timeFormat?: TimeFormat
  timezone?: string
  locale?: string
  includeTime?: boolean
  includeDate?: boolean
  relative?: boolean
  precision?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
}

interface DateRange {
  start: Date
  end: Date
}

export const useDateTimeFormatting = () => {
  const { effectivePreferences, getAvailableTimezones } = useI18n()
  const supabase = useSupabaseClient<Database>()

  // Reactive state
  const timezones = ref<Timezone[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load timezones from database
  const loadTimezones = async () => {
    try {
      loading.value = true
      error.value = null

      const timezoneData = await getAvailableTimezones()
      timezones.value = timezoneData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load timezones'
      console.error('Error loading timezones:', err)
    } finally {
      loading.value = false
    }
  }

  // Get timezone information
  const getTimezone = (timezoneId: string): Timezone | undefined => {
    return timezones.value.find(tz => tz.id === timezoneId)
  }

  // Convert date to specific timezone
  const convertToTimezone = (date: Date, timezoneId: string): Date => {
    const timezone = getTimezone(timezoneId)
    if (!timezone) return date

    // In a real implementation, you'd use a library like date-fns-tz or moment-timezone
    // For now, we'll use a simple offset conversion
    const offset = parseTimezoneOffset(timezone.utc_offset)
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
    return new Date(utcTime + (offset * 60000))
  }

  // Parse timezone offset string (e.g., "+05:30", "-08:00")
  const parseTimezoneOffset = (offset: string): number => {
    const match = offset.match(/^([+-])(\d{2}):(\d{2})$/)
    if (!match) return 0

    const [, sign, hours, minutes] = match
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes)
    return sign === '+' ? totalMinutes : -totalMinutes
  }

  // Format date according to user preferences
  const formatDate = (
    date: Date | string,
    options: DateTimeFormatOptions = {}
  ): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const dateFormat = options.dateFormat || effectivePreferences.value?.date_format || 'MM/DD/YYYY'
    const locale = options.locale || effectivePreferences.value?.number_format || 'en-US'
    const timezone = options.timezone || effectivePreferences.value?.timezone_id

    let targetDate = dateObj
    if (timezone) {
      targetDate = convertToTimezone(dateObj, timezone)
    }

    try {
      const formatMap: Record<DateFormat, Intl.DateTimeFormatOptions> = {
        'MM/DD/YYYY': { year: 'numeric', month: '2-digit', day: '2-digit' },
        'DD/MM/YYYY': { year: 'numeric', month: '2-digit', day: '2-digit' },
        'YYYY-MM-DD': { year: 'numeric', month: '2-digit', day: '2-digit' },
        'DD-MM-YYYY': { year: 'numeric', month: '2-digit', day: '2-digit' },
        'MM.DD.YYYY': { year: 'numeric', month: '2-digit', day: '2-digit' },
        'DD.MM.YYYY': { year: 'numeric', month: '2-digit', day: '2-digit' },
        'YYYY/MM/DD': { year: 'numeric', month: '2-digit', day: '2-digit' },
        'DD/MM/YY': { year: '2-digit', month: '2-digit', day: '2-digit' }
      }

      const formatOptions = formatMap[dateFormat] || formatMap['MM/DD/YYYY']
      const formatted = new Intl.DateTimeFormat(locale, formatOptions).format(targetDate)

      // Apply custom formatting based on the format string
      return applyCustomDateFormat(formatted, dateFormat, targetDate)
    } catch (err) {
      console.error('Error formatting date:', err)
      return dateObj.toLocaleDateString()
    }
  }

  // Apply custom date formatting
  const applyCustomDateFormat = (formatted: string, format: DateFormat, date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const shortYear = String(year).slice(-2)

    switch (format) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`
      case 'MM.DD.YYYY':
        return `${month}.${day}.${year}`
      case 'DD.MM.YYYY':
        return `${day}.${month}.${year}`
      case 'YYYY/MM/DD':
        return `${year}/${month}/${day}`
      case 'DD/MM/YY':
        return `${day}/${month}/${shortYear}`
      default:
        return formatted
    }
  }

  // Format time according to user preferences
  const formatTime = (
    date: Date | string,
    options: DateTimeFormatOptions = {}
  ): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const timeFormat = options.timeFormat || effectivePreferences.value?.time_format || '12h'
    const locale = options.locale || effectivePreferences.value?.number_format || 'en-US'
    const timezone = options.timezone || effectivePreferences.value?.timezone_id

    let targetDate = dateObj
    if (timezone) {
      targetDate = convertToTimezone(dateObj, timezone)
    }

    try {
      const formatOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: timeFormat === '12h'
      }

      return new Intl.DateTimeFormat(locale, formatOptions).format(targetDate)
    } catch (err) {
      console.error('Error formatting time:', err)
      return dateObj.toLocaleTimeString()
    }
  }

  // Format date and time together
  const formatDateTime = (
    date: Date | string,
    options: DateTimeFormatOptions = {}
  ): string => {
    const dateStr = formatDate(date, { ...options, includeTime: false })
    const timeStr = formatTime(date, { ...options, includeDate: false })
    return `${dateStr} ${timeStr}`
  }

  // Format relative time (e.g., "2 hours ago", "in 3 days")
  const formatRelativeTime = (
    date: Date | string,
    options: DateTimeFormatOptions = {}
  ): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const locale = options.locale || effectivePreferences.value?.number_format || 'en-US'
    const precision = options.precision || 'minute'

    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
      const now = new Date()
      const diffInSeconds = (dateObj.getTime() - now.getTime()) / 1000

      const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
        { unit: 'year', seconds: 31536000 },
        { unit: 'month', seconds: 2592000 },
        { unit: 'day', seconds: 86400 },
        { unit: 'hour', seconds: 3600 },
        { unit: 'minute', seconds: 60 },
        { unit: 'second', seconds: 1 }
      ]

      for (const { unit, seconds } of units) {
        const value = Math.round(diffInSeconds / seconds)
        if (Math.abs(value) >= 1) {
          return rtf.format(value, unit)
        }
      }

      return rtf.format(0, 'second')
    } catch (err) {
      console.error('Error formatting relative time:', err)
      return formatDateTime(date, options)
    }
  }

  // Format date range
  const formatDateRange = (
    range: DateRange,
    options: DateTimeFormatOptions = {}
  ): string => {
    const start = formatDate(range.start, options)
    const end = formatDate(range.end, options)
    return `${start} - ${end}`
  }

  // Parse date string
  const parseDate = (dateString: string, format?: DateFormat): Date | null => {
    try {
      // Simple parsing based on common formats
      const formats = [
        /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
        /^(\d{2})\/(\d{2})\/(\d{2})$/, // MM/DD/YY
        /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
        /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
        /^(\d{2})\.(\d{2})\.(\d{4})$/, // DD.MM.YYYY
      ]

      for (const regex of formats) {
        const match = dateString.match(regex)
        if (match) {
          const [, part1, part2, part3] = match
          
          // Determine format based on the pattern
          if (regex.source.includes('(\\d{4})')) {
            // Year is first or last
            if (regex.source.startsWith('(\\d{4})')) {
              return new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3))
            } else {
              return new Date(parseInt(part3), parseInt(part2) - 1, parseInt(part1))
            }
          } else {
            // Assume MM/DD/YYYY format
            return new Date(parseInt(part3), parseInt(part1) - 1, parseInt(part2))
          }
        }
      }

      // Fallback to native parsing
      return new Date(dateString)
    } catch (err) {
      console.error('Error parsing date:', err)
      return null
    }
  }

  // Get available timezone options
  const getTimezoneOptions = (): Array<{ value: string; label: string; offset: string }> => {
    return timezones.value.map(tz => ({
      value: tz.id,
      label: `${tz.name} (${tz.utc_offset})`,
      offset: tz.utc_offset
    }))
  }

  // Get available date format options
  const getDateFormatOptions = () => {
    return [
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
      { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
      { value: 'MM.DD.YYYY', label: 'MM.DD.YYYY' },
      { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY' },
      { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD' },
      { value: 'DD/MM/YY', label: 'DD/MM/YY' }
    ]
  }

  // Get available time format options
  const getTimeFormatOptions = () => {
    return [
      { value: '12h', label: '12 Hour (AM/PM)' },
      { value: '24h', label: '24 Hour' }
    ]
  }

  // Validate date
  const isValidDate = (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return !isNaN(dateObj.getTime())
  }

  // Get current date in user's timezone
  const getCurrentDate = (): Date => {
    const timezone = effectivePreferences.value?.timezone_id
    if (timezone) {
      return convertToTimezone(new Date(), timezone)
    }
    return new Date()
  }

  // Get start of day
  const getStartOfDay = (date: Date): Date => {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    return start
  }

  // Get end of day
  const getEndOfDay = (date: Date): Date => {
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    return end
  }

  // Get start of week
  const getStartOfWeek = (date: Date, startDay: number = 0): Date => {
    const start = new Date(date)
    const day = start.getDay()
    const diff = day - startDay
    start.setDate(start.getDate() - diff)
    return getStartOfDay(start)
  }

  // Get end of week
  const getEndOfWeek = (date: Date, startDay: number = 0): Date => {
    const start = getStartOfWeek(date, startDay)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return getEndOfDay(end)
  }

  // Get start of month
  const getStartOfMonth = (date: Date): Date => {
    const start = new Date(date)
    start.setDate(1)
    return getStartOfDay(start)
  }

  // Get end of month
  const getEndOfMonth = (date: Date): Date => {
    const end = new Date(date)
    end.setMonth(end.getMonth() + 1, 0)
    return getEndOfDay(end)
  }

  // Initialize timezones
  const initialize = async () => {
    await loadTimezones()
  }

  // Auto-initialize
  onMounted(initialize)

  return {
    // State
    timezones: readonly(timezones),
    loading: readonly(loading),
    error: readonly(error),

    // Core formatting functions
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime,
    formatDateRange,

    // Utility functions
    parseDate,
    convertToTimezone,
    getTimezone,
    getCurrentDate,
    isValidDate,

    // Date manipulation functions
    getStartOfDay,
    getEndOfDay,
    getStartOfWeek,
    getEndOfWeek,
    getStartOfMonth,
    getEndOfMonth,

    // Options getters
    getTimezoneOptions,
    getDateFormatOptions,
    getTimeFormatOptions,

    // Actions
    loadTimezones,
    initialize
  }
}
