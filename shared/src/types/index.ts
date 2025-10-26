// Database entity types
export interface User {
  id: string
  email: string
  name: string
  team_id: string
  created_at: string
  updated_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
  two_factor_enabled: boolean
}

export interface Team {
  id: string
  name: string
  slug: string
  base_currency_code: string
  default_unit_family: string
  default_date_format: string
  default_time_format: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role_id: string
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  team_id: string
  name: string
  description?: string
  is_system_role: boolean
  created_at: string
  updated_at: string
}

export interface RolePermission {
  id: string
  role_id: string
  action: string
  resource: string
  location_scope?: string
  created_at: string
}

// I18N types
export interface I18nConfig {
  base_currency_code: string
  default_unit_family: string
  default_date_format: string
  default_time_format: string
}

export interface UserI18nOverrides {
  override_unit_family?: string
  override_date_format?: string
  override_time_format?: string
}

// Plan and feature gating types
export interface PlanCapability {
  id: string
  feature_id: string
  limit: number
  window: string
  created_at: string
  updated_at: string
}

export interface UsageCounter {
  id: string
  team_id: string
  feature_id: string
  count: number
  window_start: string
  window_end: string
  created_at: string
  updated_at: string
}

export interface GraceWindow {
  id: string
  team_id: string
  feature_id: string
  active: boolean
  expires_at: string
  created_at: string
}

// RFC-7807 error response types
export interface PlanLimitError {
  type: 'https://makerly.app/problems/plan-limit-exceeded'
  title: string
  status: number
  detail: string
  instance: string
  code: string
  feature_id: string
  limit: number
  used: number
  remaining: number
  grace: {
    active: boolean
    expires_at?: string
  }
  upgrade_url: string
  user_message: string
}

// Common API response types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

// Unit conversion types
export type UnitFamily = 'mass' | 'volume' | 'count' | 'length' | 'area' | 'temperature'

export interface Unit {
  id: string
  name: string
  symbol: string
  family: UnitFamily
  base_multiplier: number
  is_base_unit: boolean
}

export interface UnitConversion {
  from_unit: string
  to_unit: string
  multiplier: number
}

// Currency types
export interface Currency {
  code: string
  name: string
  symbol: string
  decimal_places: number
}

// Audit logging types
export interface AuditLog {
  id: string
  user_id: string
  team_id: string
  action: string
  resource_type: string
  resource_id: string
  changes?: Record<string, any>
  metadata?: Record<string, any>
  created_at: string
}
