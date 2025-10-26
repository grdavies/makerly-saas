# I18N Infrastructure Documentation

## Overview

The Makerly SaaS I18N (Internationalization) infrastructure provides comprehensive support for multi-language, multi-currency, and multi-unit formatting across the application. The system is designed with a hierarchical approach where team-level defaults can be overridden by user-level preferences.

## Architecture

### Database Schema

The I18N system uses several database tables to store configuration and preferences:

#### Core Tables
- **`currencies`** - Available currencies with symbols and decimal places
- **`unit_families`** - Unit families (metric, imperial, custom)
- **`units`** - Individual units within families with conversion factors
- **`timezones`** - Available timezones with UTC offsets
- **`team_i18n_preferences`** - Team-level I18N defaults
- **`user_i18n_preferences`** - User-level overrides

#### Enhanced Tables
- **`teams`** - Extended with I18N configuration fields
- **`users`** - Extended with I18N override fields

### Composable Architecture

The I18N system is built around focused, reusable composables:

1. **`useI18n`** - Core I18N management and preferences
2. **`useCurrencyFormatting`** - Currency formatting and conversion
3. **`useDateTimeFormatting`** - Date/time formatting with timezone support
4. **`useUnitConversion`** - Unit conversion between families and units

## Features

### Currency Support
- **20+ Currencies** - USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, SEK, NZD, MXN, SGD, HKD, NOK, TRY, RUB, INR, BRL, ZAR, KRW
- **Dynamic Formatting** - Locale-aware currency formatting
- **Exchange Rates** - Mock exchange rate system (extensible to real APIs)
- **Abbreviation Support** - K, M, B, T suffixes for large amounts
- **Range Formatting** - Format currency ranges (e.g., "$100 - $500")

### Date/Time Support
- **8 Date Formats** - MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, MM.DD.YYYY, DD.MM.YYYY, YYYY/MM/DD, DD/MM/YY
- **2 Time Formats** - 12-hour (AM/PM) and 24-hour
- **Timezone Support** - 12+ common timezones with UTC offset handling
- **Relative Time** - "2 hours ago", "in 3 days" formatting
- **Date Manipulation** - Start/end of day, week, month functions

### Unit Conversion
- **6 Unit Families** - Length, Weight, Volume, Temperature, Area, Speed
- **Smart Conversion** - Automatic conversion between compatible units
- **Temperature Special Handling** - Celsius, Fahrenheit, Kelvin conversion
- **Base Unit System** - All conversions go through base units
- **Precision Control** - Configurable decimal places

### User Experience
- **Hierarchical Preferences** - Team defaults with user overrides
- **Real-time Preview** - Live preview of formatting changes
- **Admin Controls** - Team admins can set team defaults
- **Reset to Defaults** - Users can reset to team preferences
- **Validation** - Comprehensive input validation with Zod schemas

## API Endpoints

### User Preferences
- **GET** `/api/i18n/user-preferences` - Get user's I18N preferences
- **PUT** `/api/i18n/user-preferences` - Update user preferences
- **DELETE** `/api/i18n/user-preferences` - Reset to team defaults

### Team Preferences (Admin Only)
- **GET** `/api/i18n/team-preferences?team_id={id}` - Get team preferences
- **PUT** `/api/i18n/team-preferences?team_id={id}` - Update team preferences

### Reference Data
- **GET** `/api/i18n/currencies` - Get available currencies
- **GET** `/api/i18n/unit-families` - Get unit families with units
- **GET** `/api/i18n/timezones` - Get available timezones

## Usage Examples

### Basic Currency Formatting
```typescript
const { formatCurrency, formatCurrencyAbbreviated } = useCurrencyFormatting()

// Format with user's preferred currency
formatCurrency(1234.56) // "$1,234.56" (if USD)

// Format with specific currency
formatCurrency(1234.56, { currency: 'EUR' }) // "€1,234.56"

// Abbreviated formatting
formatCurrencyAbbreviated(1234567) // "$1.2M"
```

### Date/Time Formatting
```typescript
const { formatDate, formatTime, formatDateTime, formatRelativeTime } = useDateTimeFormatting()

// Format with user's preferences
formatDate(new Date()) // "12/25/2023" (if MM/DD/YYYY)
formatTime(new Date()) // "2:30 PM" (if 12h format)
formatDateTime(new Date()) // "12/25/2023 2:30 PM"

// Relative time
formatRelativeTime(new Date(Date.now() - 3600000)) // "1 hour ago"
```

### Unit Conversion
```typescript
const { convert, formatUnit, convertWithUserPreferences } = useUnitConversion()

// Convert between units
const result = convert(100, 'meter', 'kilometer')
// { value: 0.1, unit: 'kilometer', symbol: 'km', formatted: '0.1 km' }

// Format with user's preferred unit family
const formatted = convertWithUserPreferences(100, 'meter', 'metric')
// Automatically converts to user's preferred metric unit
```

### Managing Preferences
```typescript
const { 
  saveUserPreferences, 
  resetUserPreferences,
  effectivePreferences 
} = useI18n()

// Save user preferences
await saveUserPreferences({
  currency_code: 'EUR',
  unit_family: 'metric',
  date_format: 'DD/MM/YYYY'
})

// Reset to team defaults
await resetUserPreferences()

// Access effective preferences
console.log(effectivePreferences.value) // Merged user + team preferences
```

## Database Functions

### Helper Functions
- **`get_user_i18n_preferences(user_uuid)`** - Get merged user preferences
- **`get_user_currency(user_uuid)`** - Get effective currency for user
- **`get_user_unit_family(user_uuid)`** - Get effective unit family for user

### RLS Policies
- **Read Access** - All authenticated users can read reference data
- **User Preferences** - Users can read/update their own preferences
- **Team Preferences** - Team admins can read/update team preferences

## Configuration

### Environment Variables
```bash
# Supabase configuration (required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Nuxt Configuration
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      {
        code: 'en',
        name: 'English',
        file: 'en.json',
        iso: 'en-US'
      }
    ],
    lazy: true,
    langDir: 'locales/',
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false
    }
  }
})
```

## Security Features

### Row-Level Security (RLS)
- **Multi-tenant Isolation** - Users can only access their own preferences
- **Team-based Access** - Team members can read team preferences
- **Admin Controls** - Only team admins can modify team preferences
- **Audit Logging** - All changes are logged for compliance

### Input Validation
- **Zod Schemas** - Comprehensive validation for all API inputs
- **Type Safety** - Full TypeScript support with generated database types
- **Error Handling** - Graceful error handling with user-friendly messages

## Performance Considerations

### Caching Strategy
- **Reference Data** - Currencies, units, timezones cached in composables
- **Exchange Rates** - 24-hour cache for exchange rate data
- **Preferences** - Reactive state management with automatic updates

### Database Optimization
- **Indexes** - Optimized indexes on frequently queried columns
- **Efficient Queries** - Single queries with joins for related data
- **Connection Pooling** - Supabase handles connection pooling automatically

## Testing

### Unit Tests
```typescript
// Example test for currency formatting
describe('Currency Formatting', () => {
  it('should format USD currency correctly', () => {
    const { formatCurrency } = useCurrencyFormatting()
    expect(formatCurrency(1234.56, { currency: 'USD' })).toBe('$1,234.56')
  })
})
```

### Integration Tests
```typescript
// Example test for API endpoints
describe('I18N API', () => {
  it('should save user preferences', async () => {
    const response = await $fetch('/api/i18n/user-preferences', {
      method: 'PUT',
      body: { currency_code: 'EUR' }
    })
    expect(response.success).toBe(true)
  })
})
```

## Migration Guide

### From Basic I18N
1. **Install Dependencies** - Add @nuxtjs/i18n to your project
2. **Run Migrations** - Apply I18N database migrations
3. **Update Composables** - Replace basic formatting with I18N composables
4. **Configure Preferences** - Set up team and user preferences
5. **Test Integration** - Verify all formatting works correctly

### Database Migration
```sql
-- Apply I18N infrastructure migration
pnpm db:migrate
```

## Troubleshooting

### Common Issues

#### Currency Not Formatting
- **Check Preferences** - Verify user has currency preference set
- **Validate Currency Code** - Ensure currency code is valid
- **Check Locale** - Verify number format locale is correct

#### Date Format Issues
- **Timezone Problems** - Check timezone configuration
- **Format Validation** - Ensure date format is supported
- **Browser Compatibility** - Test in different browsers

#### Unit Conversion Errors
- **Unit Family Mismatch** - Ensure units are in same family
- **Base Unit Missing** - Check that family has base unit defined
- **Conversion Factor** - Verify conversion factors are correct

### Debug Mode
```typescript
// Enable debug logging
const { effectivePreferences } = useI18n()
console.log('Effective preferences:', effectivePreferences.value)
```

## Future Enhancements

### Planned Features
- **Real Exchange Rates** - Integration with currency API
- **More Languages** - Support for additional locales
- **Custom Units** - User-defined unit families
- **Bulk Operations** - Batch preference updates
- **Analytics** - Usage tracking for preferences

### Extensibility
- **Plugin System** - Custom formatters for specific domains
- **Theme Integration** - I18N-aware theme switching
- **Mobile Optimization** - Touch-friendly preference interfaces
- **Offline Support** - Cached preferences for offline use

## Contributing

### Development Setup
1. **Clone Repository** - Get the latest code
2. **Install Dependencies** - Run `pnpm install`
3. **Setup Database** - Configure Supabase connection
4. **Run Migrations** - Apply database schema
5. **Start Development** - Run `pnpm dev`

### Code Standards
- **TypeScript** - Full type safety required
- **Composables** - Single responsibility principle
- **Error Handling** - Comprehensive error handling
- **Documentation** - JSDoc comments for all functions
- **Testing** - Unit and integration tests required

### Pull Request Process
1. **Create Feature Branch** - From `develop` branch
2. **Implement Changes** - Follow coding standards
3. **Add Tests** - Include comprehensive test coverage
4. **Update Documentation** - Update relevant docs
5. **Submit PR** - Include detailed description
6. **Code Review** - Address feedback and suggestions
7. **Merge** - After approval and CI passes
