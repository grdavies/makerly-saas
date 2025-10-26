import { useI18n } from './useI18n'
import { useSupabaseClient } from '#imports'
import type { Database } from '@shared/types/supabase'

type UnitFamily = Database['public']['Enums']['unit_family']

interface Unit {
  id: string
  family_id: string
  name: string
  symbol: string
  conversion_factor: number
  is_base_unit: boolean
  is_active: boolean
}

interface UnitFamily {
  id: string
  name: string
  family_type: UnitFamily
  base_unit: string
  is_active: boolean
}

interface UnitConversionOptions {
  fromUnit?: string
  toUnit?: string
  precision?: number
  family?: UnitFamily
}

interface ConversionResult {
  value: number
  unit: string
  symbol: string
  formatted: string
}

export const useUnitConversion = () => {
  const { effectivePreferences, getAvailableUnitFamilies } = useI18n()
  const supabase = useSupabaseClient<Database>()

  // Reactive state
  const unitFamilies = ref<UnitFamily[]>([])
  const units = ref<Unit[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load unit families and units from database
  const loadUnits = async () => {
    try {
      loading.value = true
      error.value = null

      // Load unit families
      const familyData = await getAvailableUnitFamilies()
      unitFamilies.value = familyData

      // Load units for each family
      const { data: unitData, error: fetchError } = await supabase
        .from('units')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (fetchError) throw fetchError
      units.value = unitData || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load units'
      console.error('Error loading units:', err)
    } finally {
      loading.value = false
    }
  }

  // Get unit family by ID
  const getUnitFamily = (familyId: string): UnitFamily | undefined => {
    return unitFamilies.value.find(family => family.id === familyId)
  }

  // Get unit family by name
  const getUnitFamilyByName = (name: string): UnitFamily | undefined => {
    return unitFamilies.value.find(family => family.name.toLowerCase() === name.toLowerCase())
  }

  // Get units for a specific family
  const getUnitsForFamily = (familyId: string): Unit[] => {
    return units.value.filter(unit => unit.family_id === familyId)
  }

  // Get base unit for a family
  const getBaseUnit = (familyId: string): Unit | undefined => {
    return units.value.find(unit => unit.family_id === familyId && unit.is_base_unit)
  }

  // Get unit by ID
  const getUnit = (unitId: string): Unit | undefined => {
    return units.value.find(unit => unit.id === unitId)
  }

  // Get unit by name or symbol
  const getUnitByName = (name: string): Unit | undefined => {
    return units.value.find(unit => 
      unit.name.toLowerCase() === name.toLowerCase() || 
      unit.symbol.toLowerCase() === name.toLowerCase()
    )
  }

  // Convert between units
  const convert = (
    value: number,
    fromUnitId: string,
    toUnitId: string,
    options: UnitConversionOptions = {}
  ): ConversionResult => {
    const fromUnit = getUnit(fromUnitId)
    const toUnit = getUnit(toUnitId)

    if (!fromUnit || !toUnit) {
      throw new Error('Invalid unit IDs provided')
    }

    if (fromUnit.family_id !== toUnit.family_id) {
      throw new Error('Cannot convert between different unit families')
    }

    // Convert to base unit first, then to target unit
    const baseValue = value * fromUnit.conversion_factor
    const convertedValue = baseValue / toUnit.conversion_factor

    const precision = options.precision ?? 2
    const roundedValue = Math.round(convertedValue * Math.pow(10, precision)) / Math.pow(10, precision)

    return {
      value: roundedValue,
      unit: toUnit.name,
      symbol: toUnit.symbol,
      formatted: `${roundedValue} ${toUnit.symbol}`
    }
  }

  // Convert to base unit
  const convertToBase = (value: number, fromUnitId: string): ConversionResult => {
    const fromUnit = getUnit(fromUnitId)
    if (!fromUnit) throw new Error('Invalid unit ID')

    const baseUnit = getBaseUnit(fromUnit.family_id)
    if (!baseUnit) throw new Error('No base unit found for family')

    return convert(value, fromUnitId, baseUnit.id)
  }

  // Convert from base unit
  const convertFromBase = (value: number, toUnitId: string): ConversionResult => {
    const toUnit = getUnit(toUnitId)
    if (!toUnit) throw new Error('Invalid unit ID')

    const baseUnit = getBaseUnit(toUnit.family_id)
    if (!baseUnit) throw new Error('No base unit found for family')

    return convert(value, baseUnit.id, toUnitId)
  }

  // Convert using user's preferred unit family
  const convertToPreferred = (
    value: number,
    fromUnitId: string,
    family: UnitFamily
  ): ConversionResult => {
    const fromUnit = getUnit(fromUnitId)
    if (!fromUnit) throw new Error('Invalid unit ID')

    const preferredFamily = getUnitFamilyByName(family)
    if (!preferredFamily) throw new Error('Invalid unit family')

    // If already in the preferred family, return as-is
    if (fromUnit.family_id === preferredFamily.id) {
      return {
        value,
        unit: fromUnit.name,
        symbol: fromUnit.symbol,
        formatted: `${value} ${fromUnit.symbol}`
      }
    }

    // Convert to base unit of preferred family
    const baseValue = convertToBase(value, fromUnitId)
    const preferredBaseUnit = getBaseUnit(preferredFamily.id)
    
    if (!preferredBaseUnit) throw new Error('No base unit found for preferred family')

    return {
      value: baseValue.value,
      unit: preferredBaseUnit.name,
      symbol: preferredBaseUnit.symbol,
      formatted: `${baseValue.value} ${preferredBaseUnit.symbol}`
    }
  }

  // Format unit value with proper formatting
  const formatUnit = (
    value: number,
    unitId: string,
    options: UnitConversionOptions = {}
  ): string => {
    const unit = getUnit(unitId)
    if (!unit) throw new Error('Invalid unit ID')

    const precision = options.precision ?? 2
    const formattedValue = value.toFixed(precision)
    
    return `${formattedValue} ${unit.symbol}`
  }

  // Get unit options for a family
  const getUnitOptions = (familyId: string): Array<{ value: string; label: string; symbol: string }> => {
    return getUnitsForFamily(familyId).map(unit => ({
      value: unit.id,
      label: `${unit.name} (${unit.symbol})`,
      symbol: unit.symbol
    }))
  }

  // Get all unit family options
  const getUnitFamilyOptions = (): Array<{ value: UnitFamily; label: string }> => {
    return unitFamilies.value.map(family => ({
      value: family.family_type,
      label: family.name
    }))
  }

  // Validate unit conversion
  const canConvert = (fromUnitId: string, toUnitId: string): boolean => {
    const fromUnit = getUnit(fromUnitId)
    const toUnit = getUnit(toUnitId)
    
    return fromUnit && toUnit && fromUnit.family_id === toUnit.family_id
  }

  // Get conversion factor between units
  const getConversionFactor = (fromUnitId: string, toUnitId: string): number => {
    const fromUnit = getUnit(fromUnitId)
    const toUnit = getUnit(toUnitId)

    if (!fromUnit || !toUnit) return 1
    if (fromUnit.family_id !== toUnit.family_id) return 1

    return fromUnit.conversion_factor / toUnit.conversion_factor
  }

  // Temperature conversion (special case)
  const convertTemperature = (
    value: number,
    fromUnit: string,
    toUnit: string
  ): ConversionResult => {
    const temperatureConversions: Record<string, (val: number) => number> = {
      'celsius-to-fahrenheit': (c) => (c * 9/5) + 32,
      'fahrenheit-to-celsius': (f) => (f - 32) * 5/9,
      'celsius-to-kelvin': (c) => c + 273.15,
      'kelvin-to-celsius': (k) => k - 273.15,
      'fahrenheit-to-kelvin': (f) => ((f - 32) * 5/9) + 273.15,
      'kelvin-to-fahrenheit': (k) => ((k - 273.15) * 9/5) + 32
    }

    const conversionKey = `${fromUnit.toLowerCase()}-to-${toUnit.toLowerCase()}`
    const converter = temperatureConversions[conversionKey]

    if (!converter) {
      throw new Error(`Cannot convert temperature from ${fromUnit} to ${toUnit}`)
    }

    const convertedValue = converter(value)
    const roundedValue = Math.round(convertedValue * 100) / 100

    return {
      value: roundedValue,
      unit: toUnit,
      symbol: getTemperatureSymbol(toUnit),
      formatted: `${roundedValue}°${getTemperatureSymbol(toUnit)}`
    }
  }

  // Get temperature symbol
  const getTemperatureSymbol = (unit: string): string => {
    const symbols: Record<string, string> = {
      'celsius': 'C',
      'fahrenheit': 'F',
      'kelvin': 'K'
    }
    return symbols[unit.toLowerCase()] || unit.charAt(0).toUpperCase()
  }

  // Smart conversion that handles temperature specially
  const smartConvert = (
    value: number,
    fromUnitId: string,
    toUnitId: string,
    options: UnitConversionOptions = {}
  ): ConversionResult => {
    const fromUnit = getUnit(fromUnitId)
    const toUnit = getUnit(toUnitId)

    if (!fromUnit || !toUnit) {
      throw new Error('Invalid unit IDs provided')
    }

    // Check if this is a temperature conversion
    const temperatureFamily = getUnitFamilyByName('Temperature')
    if (temperatureFamily && fromUnit.family_id === temperatureFamily.id) {
      return convertTemperature(value, fromUnit.name, toUnit.name)
    }

    // Use standard conversion for other units
    return convert(value, fromUnitId, toUnitId, options)
  }

  // Get user's preferred unit for a family
  const getUserPreferredUnit = (family: UnitFamily): Unit | undefined => {
    const preferredFamily = getUnitFamilyByName(family)
    if (!preferredFamily) return undefined

    const familyUnits = getUnitsForFamily(preferredFamily.id)
    
    // Return the base unit as default
    return familyUnits.find(unit => unit.is_base_unit) || familyUnits[0]
  }

  // Convert using user's effective preferences
  const convertWithUserPreferences = (
    value: number,
    fromUnitId: string,
    family: UnitFamily
  ): ConversionResult => {
    const userFamily = effectivePreferences.value?.unit_family || 'metric'
    
    if (userFamily === family) {
      // User prefers this family, convert to a reasonable unit
      const preferredUnit = getUserPreferredUnit(family)
      if (preferredUnit) {
        return convert(value, fromUnitId, preferredUnit.id)
      }
    }

    // Convert to base unit
    return convertToBase(value, fromUnitId)
  }

  // Initialize units
  const initialize = async () => {
    await loadUnits()
  }

  // Auto-initialize
  onMounted(initialize)

  return {
    // State
    unitFamilies: readonly(unitFamilies),
    units: readonly(units),
    loading: readonly(loading),
    error: readonly(error),

    // Core conversion functions
    convert,
    convertToBase,
    convertFromBase,
    convertToPreferred,
    smartConvert,
    convertTemperature,
    convertWithUserPreferences,

    // Utility functions
    formatUnit,
    getUnit,
    getUnitByName,
    getUnitFamily,
    getUnitFamilyByName,
    getUnitsForFamily,
    getBaseUnit,
    getUserPreferredUnit,
    canConvert,
    getConversionFactor,

    // Options getters
    getUnitOptions,
    getUnitFamilyOptions,

    // Actions
    loadUnits,
    initialize
  }
}
