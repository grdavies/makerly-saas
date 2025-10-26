# Supabase Client Configuration Documentation

This document describes the comprehensive Supabase client setup for the Makerly SaaS platform, including composables, middleware, and authentication flows.

## Overview

The Supabase client configuration provides:
- **Type-safe database operations** with generated TypeScript types
- **Authentication composables** for user management and session handling
- **RBAC composables** for permission checking and role management
- **Team management** for multi-tenant operations
- **User management** for profile and team member operations
- **Middleware** for route protection and access control

## Client Configuration

### Shared Supabase Client (`shared/src/lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@shared/types/supabase'

// Create Supabase client with proper typing
export function createSupabaseClient(config: SupabaseConfig) {
  return createClient<Database>(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })
}
```

### Nuxt Configuration

Both `web` and `marketing` applications are configured with:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/supabase'],
  
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      exclude: ['/']
    }
  },
  
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  }
})
```

## Composables

### 1. Authentication Composable (`useAuth`)

**Location:** `web/composables/useAuth.ts`

**Features:**
- User session management
- Profile loading from custom users table
- Team membership loading
- Role-based state management
- Authentication methods (sign in, sign up, sign out)

**Usage:**
```vue
<script setup>
const { 
  user, 
  session, 
  profile, 
  teams, 
  currentTeam, 
  currentRole,
  isAuthenticated,
  isSuperAdmin,
  isTeamAdmin,
  signIn,
  signOut,
  switchTeam
} = useAuth()
</script>
```

**Methods:**
- `signIn(email, password)` - Sign in with email/password
- `signUp(email, password, metadata)` - Create new account
- `signOut()` - Sign out current user
- `resetPassword(email)` - Send password reset email
- `updatePassword(password)` - Update user password
- `switchTeam(teamId)` - Switch to different team
- `loadUserProfile()` - Reload user profile
- `loadUserTeams()` - Reload user teams

### 2. RBAC Composable (`useRBAC`)

**Location:** `web/composables/useRBAC.ts`

**Features:**
- Permission checking with database queries
- Role-based access control
- Hierarchical permission system
- Resource-specific permission checks

**Usage:**
```vue
<script setup>
const { 
  hasPermission,
  can,
  canCreate,
  canRead,
  canUpdate,
  canDelete,
  canManageTeamMembers,
  canManageRoles,
  belongsToTeam,
  isAdminOfTeam
} = useRBAC()

// Check specific permission
const canManageUsers = await can('update', 'user', 'team')

// Check resource permissions
const canCreateInventory = await canCreate('inventory', 'team')
</script>
```

**Methods:**
- `hasPermission(action, resource, location)` - Check specific permission
- `can(action, resource, location)` - Alias for hasPermission
- `canCreate(resource, location)` - Check create permission
- `canRead(resource, location)` - Check read permission
- `canUpdate(resource, location)` - Check update permission
- `canDelete(resource, location)` - Check delete permission
- `getResourcePermissions(resource, location)` - Get all permissions for resource
- `getAllPermissions()` - Get all user permissions

### 3. Team Management Composable (`useTeam`)

**Location:** `web/composables/useTeam.ts`

**Features:**
- Team CRUD operations
- Team member management
- Team settings management
- Team statistics

**Usage:**
```vue
<script setup>
const { 
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  getTeamStats
} = useTeam()

// Get team members
const members = await getTeamMembers()

// Add new team member
await addTeamMember({
  team_id: teamId,
  user_id: userId,
  role_id: roleId
})
</script>
```

### 4. User Management Composable (`useUser`)

**Location:** `web/composables/useUser.ts`

**Features:**
- User profile management
- Team user operations
- User search and statistics
- User invitation system

**Usage:**
```vue
<script setup>
const { 
  getTeamUsers,
  getAllUsers,
  getUser,
  updateUserProfile,
  updateOwnProfile,
  searchUsers,
  inviteUser
} = useUser()

// Update own profile
await updateOwnProfile({
  first_name: 'John',
  last_name: 'Doe'
})

// Search users
const users = await searchUsers('john')
</script>
```

## Middleware

### 1. Authentication Middleware (`auth.ts`)

**Location:** `web/middleware/auth.ts`

**Purpose:** Protect routes that require authentication

**Features:**
- Redirects unauthenticated users to login
- Redirects authenticated users away from auth pages
- Defines public routes that don't require authentication

**Usage:**
```vue
<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
```

**Public Routes:**
- `/` (homepage)
- `/auth/login`
- `/auth/signup`
- `/auth/reset-password`
- `/auth/callback`
- `/pricing`
- `/about`
- `/contact`
- `/privacy`
- `/terms`

### 2. Admin Middleware (`admin.ts`)

**Location:** `web/middleware/admin.ts`

**Purpose:** Protect admin-only routes

**Features:**
- Checks for admin/super admin privileges
- Validates specific permissions for routes
- Throws 403 errors for unauthorized access

**Usage:**
```vue
<script setup>
definePageMeta({
  middleware: ['auth', 'admin']
})
</script>
```

**Admin Routes:**
- `/admin` - General admin area
- `/settings/team` - Team settings
- `/settings/users` - User management
- `/settings/roles` - Role management

**Super Admin Routes:**
- `/admin/system` - System administration
- `/admin/teams` - Team management
- `/admin/users` - Global user management
- `/admin/permissions` - Permission management

### 3. Guest Middleware (`guest.ts`)

**Location:** `web/middleware/guest.ts`

**Purpose:** Redirect authenticated users away from auth pages

**Usage:**
```vue
<script setup>
definePageMeta({
  middleware: 'guest'
})
</script>
```

## Authentication Pages

### 1. Login Page (`/auth/login`)

**Location:** `web/pages/auth/login.vue`

**Features:**
- Email/password authentication
- Remember me functionality
- Password reset link
- OAuth integration ready
- Form validation with Zod

### 2. Signup Page (`/auth/signup`)

**Location:** `web/pages/auth/signup.vue`

**Features:**
- User registration with profile creation
- Password confirmation
- Terms acceptance
- Email confirmation flow
- Form validation with Zod

### 3. Auth Callback (`/auth/callback`)

**Location:** `web/pages/auth/callback.vue`

**Features:**
- Handles OAuth callbacks
- Session establishment
- Profile and team loading
- Success/error states

### 4. Auth Layout (`auth.vue`)

**Location:** `web/layouts/auth.vue`

**Features:**
- Clean authentication-focused layout
- Header with navigation
- Footer with links
- Responsive design

## Type Safety

### Generated Types

The Supabase client uses generated TypeScript types from the database schema:

```typescript
// From shared/src/types/supabase.ts
export type Database = {
  public: {
    Tables: {
      teams: {
        Row: { /* team row type */ }
        Insert: { /* team insert type */ }
        Update: { /* team update type */ }
      }
      // ... other tables
    }
    Enums: {
      audit_action: 'create' | 'update' | 'delete'
      // ... other enums
    }
  }
}
```

### Usage in Composables

All composables use these types for type safety:

```typescript
// Type-safe database operations
const { data, error } = await supabase
  .from('teams')
  .select('*')
  .eq('id', teamId)
  .single()

// data is typed as Team | null
// error is typed as PostgrestError | null
```

## Environment Variables

### Required Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_PASSWORD=your-db-password

# Application URLs
NUXT_PUBLIC_APP_URL=http://localhost:3000
```

### Environment Setup

Use the provided setup script:

```bash
pnpm setup:env
```

Or manually create `.env` files in each application directory.

## Security Features

### Row-Level Security (RLS)

All database operations are protected by RLS policies:
- **Multi-tenant isolation** - Users can only access their team's data
- **Role-based access** - Permissions enforced at database level
- **Audit protection** - Audit logs are read-only and team-scoped

### Authentication Security

- **Session management** - Automatic token refresh
- **Password policies** - Enforced by Supabase Auth
- **Email confirmation** - Required for new accounts
- **Password reset** - Secure email-based reset flow

### Permission System

- **Hierarchical roles** - Super Admin > Team Admin > Member > Viewer
- **Resource-based permissions** - Action/Resource/Location scoping
- **Real-time enforcement** - Changes take effect immediately

## Best Practices

### 1. Always Use Composables

```vue
<!-- Good -->
<script setup>
const { user, isAuthenticated } = useAuth()
const { canCreate } = useRBAC()
</script>

<!-- Avoid direct Supabase client usage -->
<script setup>
const supabase = useSupabaseClient()
// Direct usage without composables
</script>
```

### 2. Check Permissions Before Operations

```vue
<script setup>
const { canCreate } = useRBAC()

const handleCreate = async () => {
  if (!(await canCreate('inventory', 'team'))) {
    throw new Error('Permission denied')
  }
  // Proceed with creation
}
</script>
```

### 3. Use Middleware for Route Protection

```vue
<script setup>
definePageMeta({
  middleware: ['auth', 'admin']
})
</script>
```

### 4. Handle Loading States

```vue
<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>Content loaded</div>
</template>
```

### 5. Use Type-Safe Operations

```typescript
// Always use generated types
const team: Team = await getTeam(teamId)

// Type-safe updates
const updates: TeamUpdate = {
  name: 'New Team Name',
  updated_at: new Date().toISOString()
}
```

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check RLS policies are active
   - Verify user has required role
   - Ensure team membership is active

2. **Authentication not working**
   - Check environment variables
   - Verify Supabase project configuration
   - Check redirect URLs

3. **Type errors**
   - Regenerate types: `pnpm db:types`
   - Check shared package exports
   - Verify import paths

### Debugging

```typescript
// Check current user context
const { user, currentTeam, currentRole } = useAuth()

// Check permissions
const { getAllPermissions } = useRBAC()
const permissions = await getAllPermissions()

// Check team membership
const { belongsToTeam } = useRBAC()
const isMember = belongsToTeam(teamId)
```

## Testing

### Test RLS Policies

```bash
pnpm db:test-rls
```

### Test Authentication Flow

1. Sign up new user
2. Verify email confirmation
3. Sign in with credentials
4. Check profile and team loading
5. Test permission checking

### Test Permission System

1. Create different user roles
2. Test permission checks
3. Verify RLS enforcement
4. Test role switching
