// Currency constants
export const CURRENCIES = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', decimal_places: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimal_places: 2 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', decimal_places: 2 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimal_places: 2 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimal_places: 2 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimal_places: 0 },
} as const

// Unit families and base units
export const UNIT_FAMILIES = {
  mass: {
    base_unit: 'gram',
    units: {
      gram: { symbol: 'g', multiplier: 1 },
      kilogram: { symbol: 'kg', multiplier: 1000 },
      pound: { symbol: 'lb', multiplier: 453.592 },
      ounce: { symbol: 'oz', multiplier: 28.3495 },
    }
  },
  volume: {
    base_unit: 'liter',
    units: {
      liter: { symbol: 'L', multiplier: 1 },
      milliliter: { symbol: 'mL', multiplier: 0.001 },
      gallon: { symbol: 'gal', multiplier: 3.78541 },
      quart: { symbol: 'qt', multiplier: 0.946353 },
      pint: { symbol: 'pt', multiplier: 0.473176 },
      cup: { symbol: 'cup', multiplier: 0.236588 },
      fluid_ounce: { symbol: 'fl oz', multiplier: 0.0295735 },
    }
  },
  count: {
    base_unit: 'piece',
    units: {
      piece: { symbol: 'pcs', multiplier: 1 },
      dozen: { symbol: 'doz', multiplier: 12 },
      gross: { symbol: 'gross', multiplier: 144 },
    }
  },
  length: {
    base_unit: 'meter',
    units: {
      meter: { symbol: 'm', multiplier: 1 },
      centimeter: { symbol: 'cm', multiplier: 0.01 },
      millimeter: { symbol: 'mm', multiplier: 0.001 },
      inch: { symbol: 'in', multiplier: 0.0254 },
      foot: { symbol: 'ft', multiplier: 0.3048 },
      yard: { symbol: 'yd', multiplier: 0.9144 },
    }
  },
  area: {
    base_unit: 'square_meter',
    units: {
      square_meter: { symbol: 'm²', multiplier: 1 },
      square_centimeter: { symbol: 'cm²', multiplier: 0.0001 },
      square_inch: { symbol: 'in²', multiplier: 0.00064516 },
      square_foot: { symbol: 'ft²', multiplier: 0.092903 },
    }
  },
  temperature: {
    base_unit: 'celsius',
    units: {
      celsius: { symbol: '°C', multiplier: 1 },
      fahrenheit: { symbol: '°F', multiplier: 1 },
      kelvin: { symbol: 'K', multiplier: 1 },
    }
  }
} as const

// Date and time format constants
export const DATE_FORMATS = {
  short: 'M/d/yyyy',
  medium: 'MMM d, yyyy',
  long: 'MMMM d, yyyy',
  full: 'EEEE, MMMM d, yyyy',
} as const

export const TIME_FORMATS = {
  short: 'h:mm a',
  medium: 'h:mm:ss a',
  long: 'h:mm:ss a z',
} as const

// System roles
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  TEAM_ADMIN: 'team_admin',
  TEAM_MEMBER: 'team_member',
  VIEWER: 'viewer',
} as const

// Permission actions
export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
} as const

// Resource types
export const RESOURCE_TYPES = {
  INVENTORY: 'inventory',
  PURCHASING: 'purchasing',
  MANUFACTURING: 'manufacturing',
  SALES: 'sales',
  REPORTS: 'reports',
  TEAM: 'team',
  USERS: 'users',
  SETTINGS: 'settings',
} as const

// Location scopes
export const LOCATION_SCOPES = {
  ALL: 'all',
  TEAM: 'team',
  SPECIFIC: 'specific',
} as const

// Plan feature IDs
export const PLAN_FEATURES = {
  USERS: 'users',
  SKUS: 'skus',
  LOCATIONS: 'locations',
  ORDERS_PER_MONTH: 'orders_per_month',
  STORAGE_GB: 'storage_gb',
  API_CALLS_PER_MONTH: 'api_calls_per_month',
  ADVANCED_REPORTING: 'advanced_reporting',
  CUSTOM_INTEGRATIONS: 'custom_integrations',
  PRIORITY_SUPPORT: 'priority_support',
} as const

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  PLAN_LIMIT_EXCEEDED: 'PLAN_LIMIT_EXCEEDED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// Cache TTL (in seconds)
export const CACHE_TTL = {
  SHORT: 300,    // 5 minutes
  MEDIUM: 1800,  // 30 minutes
  LONG: 3600,    // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/csv', 'application/vnd.ms-excel'],
} as const

// Email templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  TEAM_INVITATION: 'team_invitation',
  PLAN_UPGRADE: 'plan_upgrade',
  PLAN_DOWNGRADE: 'plan_downgrade',
  USAGE_WARNING: 'usage_warning',
} as const

// Audit log actions
export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  ROLE_ASSIGN: 'role_assign',
  ROLE_REVOKE: 'role_revoke',
  PLAN_CHANGE: 'plan_change',
} as const
