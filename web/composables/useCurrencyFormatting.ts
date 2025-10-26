import { useI18n } from './useI18n'
import { useSupabaseClient } from '#imports'
import type { Database } from '@shared/types/supabase'

type CurrencyCode = Database['public']['Enums']['currency_code']

interface Currency {
  code: CurrencyCode
  name: string
  symbol: string
  decimal_places: number
  is_active: boolean
}

interface CurrencyFormatOptions {
  currency?: CurrencyCode
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  useGrouping?: boolean
  signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero'
}

interface CurrencyConversion {
  from: CurrencyCode
  to: CurrencyCode
  rate: number
  updated_at: string
}

export const useCurrencyFormatting = () => {
  const { effectivePreferences, getAvailableCurrencies } = useI18n()
  const supabase = useSupabaseClient<Database>()

  // Reactive state
  const currencies = ref<Currency[]>([])
  const exchangeRates = ref<Map<string, CurrencyConversion>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load currencies from database
  const loadCurrencies = async () => {
    try {
      loading.value = true
      error.value = null

      const currencyData = await getAvailableCurrencies()
      currencies.value = currencyData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load currencies'
      console.error('Error loading currencies:', err)
    } finally {
      loading.value = false
    }
  }

  // Get currency information
  const getCurrency = (code: CurrencyCode): Currency | undefined => {
    return currencies.value.find(c => c.code === code)
  }

  // Get currency symbol
  const getCurrencySymbol = (code: CurrencyCode): string => {
    const currency = getCurrency(code)
    return currency?.symbol || code
  }

  // Format currency amount
  const formatCurrency = (
    amount: number,
    options: CurrencyFormatOptions = {}
  ): string => {
    const currency = options.currency || effectivePreferences.value?.currency_code || 'USD'
    const locale = options.locale || effectivePreferences.value?.number_format || 'en-US'
    const currencyInfo = getCurrency(currency)

    const formatOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: options.minimumFractionDigits ?? currencyInfo?.decimal_places ?? 2,
      maximumFractionDigits: options.maximumFractionDigits ?? currencyInfo?.decimal_places ?? 2,
      useGrouping: options.useGrouping ?? true,
      signDisplay: options.signDisplay ?? 'auto'
    }

    try {
      return new Intl.NumberFormat(locale, formatOptions).format(amount)
    } catch (err) {
      console.error('Error formatting currency:', err)
      // Fallback formatting
      const symbol = getCurrencySymbol(currency)
      return `${symbol}${amount.toFixed(currencyInfo?.decimal_places ?? 2)}`
    }
  }

  // Format currency with custom symbol
  const formatCurrencyWithSymbol = (
    amount: number,
    symbol: string,
    options: Omit<CurrencyFormatOptions, 'currency'> = {}
  ): string => {
    const locale = options.locale || effectivePreferences.value?.number_format || 'en-US'
    const currencyInfo = getCurrency(effectivePreferences.value?.currency_code || 'USD')

    const formatOptions: Intl.NumberFormatOptions = {
      style: 'decimal',
      minimumFractionDigits: options.minimumFractionDigits ?? currencyInfo?.decimal_places ?? 2,
      maximumFractionDigits: options.maximumFractionDigits ?? currencyInfo?.decimal_places ?? 2,
      useGrouping: options.useGrouping ?? true,
      signDisplay: options.signDisplay ?? 'auto'
    }

    try {
      const formatted = new Intl.NumberFormat(locale, formatOptions).format(amount)
      return `${symbol}${formatted}`
    } catch (err) {
      console.error('Error formatting currency with symbol:', err)
      return `${symbol}${amount.toFixed(currencyInfo?.decimal_places ?? 2)}`
    }
  }

  // Parse currency string to number
  const parseCurrency = (currencyString: string, currency: CurrencyCode = 'USD'): number => {
    const currencyInfo = getCurrency(currency)
    const locale = effectivePreferences.value?.number_format || 'en-US'

    try {
      // Remove currency symbol and parse
      const cleanString = currencyString.replace(/[^\d.,\-]/g, '')
      return parseFloat(cleanString.replace(',', '.'))
    } catch (err) {
      console.error('Error parsing currency:', err)
      return 0
    }
  }

  // Convert currency amount
  const convertCurrency = async (
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode
  ): Promise<number> => {
    if (from === to) return amount

    try {
      // Check if we have cached exchange rate
      const cacheKey = `${from}_${to}`
      const cachedRate = exchangeRates.value.get(cacheKey)
      
      if (cachedRate) {
        const hoursSinceUpdate = (Date.now() - new Date(cachedRate.updated_at).getTime()) / (1000 * 60 * 60)
        if (hoursSinceUpdate < 24) { // Cache for 24 hours
          return amount * cachedRate.rate
        }
      }

      // Fetch fresh exchange rate (in a real app, you'd use a currency API)
      const rate = await fetchExchangeRate(from, to)
      
      // Cache the rate
      exchangeRates.value.set(cacheKey, {
        from,
        to,
        rate,
        updated_at: new Date().toISOString()
      })

      return amount * rate
    } catch (err) {
      console.error('Error converting currency:', err)
      return amount // Return original amount if conversion fails
    }
  }

  // Fetch exchange rate (mock implementation - replace with real API)
  const fetchExchangeRate = async (from: CurrencyCode, to: CurrencyCode): Promise<number> => {
    // Mock exchange rates - in production, use a real currency API
    const mockRates: Record<string, Record<string, number>> = {
      'USD': {
        'EUR': 0.85,
        'GBP': 0.73,
        'JPY': 110.0,
        'CAD': 1.25,
        'AUD': 1.35
      },
      'EUR': {
        'USD': 1.18,
        'GBP': 0.86,
        'JPY': 129.0,
        'CAD': 1.47,
        'AUD': 1.59
      },
      'GBP': {
        'USD': 1.37,
        'EUR': 1.16,
        'JPY': 150.0,
        'CAD': 1.71,
        'AUD': 1.85
      }
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))

    const rate = mockRates[from]?.[to]
    if (rate) return rate

    // Default to 1:1 if no rate found
    console.warn(`No exchange rate found for ${from} to ${to}`)
    return 1
  }

  // Format currency with conversion
  const formatCurrencyWithConversion = async (
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode,
    options: CurrencyFormatOptions = {}
  ): Promise<string> => {
    const convertedAmount = await convertCurrency(amount, from, to)
    return formatCurrency(convertedAmount, { ...options, currency: to })
  }

  // Get currency display name
  const getCurrencyDisplayName = (code: CurrencyCode): string => {
    const currency = getCurrency(code)
    return currency?.name || code
  }

  // Get all available currencies for selection
  const getCurrencyOptions = (): Array<{ value: CurrencyCode; label: string; symbol: string }> => {
    return currencies.value.map(currency => ({
      value: currency.code,
      label: `${currency.name} (${currency.code})`,
      symbol: currency.symbol
    }))
  }

  // Validate currency code
  const isValidCurrency = (code: string): code is CurrencyCode => {
    return currencies.value.some(c => c.code === code)
  }

  // Get currency precision
  const getCurrencyPrecision = (code: CurrencyCode): number => {
    const currency = getCurrency(code)
    return currency?.decimal_places ?? 2
  }

  // Format currency range
  const formatCurrencyRange = (
    minAmount: number,
    maxAmount: number,
    options: CurrencyFormatOptions = {}
  ): string => {
    const min = formatCurrency(minAmount, options)
    const max = formatCurrency(maxAmount, options)
    return `${min} - ${max}`
  }

  // Format currency with abbreviation (e.g., $1.2K, $1.5M)
  const formatCurrencyAbbreviated = (
    amount: number,
    options: CurrencyFormatOptions = {}
  ): string => {
    const currency = options.currency || effectivePreferences.value?.currency_code || 'USD'
    const symbol = getCurrencySymbol(currency)
    
    const abbreviations = [
      { value: 1e12, symbol: 'T' },
      { value: 1e9, symbol: 'B' },
      { value: 1e6, symbol: 'M' },
      { value: 1e3, symbol: 'K' }
    ]

    for (const { value, symbol: abbr } of abbreviations) {
      if (amount >= value) {
        const abbreviated = (amount / value).toFixed(1)
        return `${symbol}${abbreviated}${abbr}`
      }
    }

    return formatCurrency(amount, options)
  }

  // Initialize currencies
  const initialize = async () => {
    await loadCurrencies()
  }

  // Auto-initialize
  onMounted(initialize)

  return {
    // State
    currencies: readonly(currencies),
    exchangeRates: readonly(exchangeRates),
    loading: readonly(loading),
    error: readonly(error),

    // Core formatting functions
    formatCurrency,
    formatCurrencyWithSymbol,
    formatCurrencyWithConversion,
    formatCurrencyRange,
    formatCurrencyAbbreviated,

    // Utility functions
    parseCurrency,
    convertCurrency,
    getCurrency,
    getCurrencySymbol,
    getCurrencyDisplayName,
    getCurrencyOptions,
    getCurrencyPrecision,
    isValidCurrency,

    // Actions
    loadCurrencies,
    initialize
  }
}
