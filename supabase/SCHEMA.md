# Database Schema Documentation

This document describes the core database schema for the Makerly SaaS platform.

## Overview

The database is designed with the following principles:
- **Multi-tenant architecture** with team-based isolation
- **Row-Level Security (RLS)** for data protection
- **Audit logging** for compliance and tracking
- **Optimistic locking** with row versioning
- **I18N support** with team and user-level configuration

## Core Tables

### Teams (`teams`)
The central tenant entity that groups users and resources.

**Columns:**
- `id` (UUID, Primary Key)
- `name` (VARCHAR) - Team display name
- `slug` (VARCHAR, Unique) - URL-friendly identifier
- `status` (ENUM) - active, inactive, suspended
- `base_currency_code` (VARCHAR) - Default currency (e.g., USD)
- `default_unit_family` (VARCHAR) - Default unit system (metric, imperial)
- `default_date_format` (VARCHAR) - Default date format
- `default_time_format` (VARCHAR) - Default time format (12h, 24h)
- `default_timezone` (VARCHAR) - Default timezone
- `created_at`, `updated_at` (TIMESTAMP)
- `row_version` (BIGINT) - Optimistic locking

### Users (`users`)
Extends Supabase auth.users with additional profile and I18N data.

**Columns:**
- `id` (UUID, Primary Key) - References auth.users(id)
- `email` (VARCHAR, Unique) - User email
- `first_name`, `last_name` (VARCHAR) - User profile
- `status` (ENUM) - active, inactive, suspended
- `override_unit_family` (VARCHAR) - User-level unit override
- `override_date_format` (VARCHAR) - User-level date format override
- `override_time_format` (VARCHAR) - User-level time format override
- `override_timezone` (VARCHAR) - User-level timezone override
- `mfa_enabled` (BOOLEAN) - Two-factor authentication status
- `mfa_secret` (VARCHAR) - MFA secret (encrypted)
- `created_at`, `updated_at`, `last_login_at` (TIMESTAMP)
- `row_version` (BIGINT) - Optimistic locking

### Team Members (`team_members`)
Many-to-many relationship between users and teams with role assignment.

**Columns:**
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key) - References teams(id)
- `user_id` (UUID, Foreign Key) - References users(id)
- `status` (ENUM) - active, inactive, pending
- `role_id` (UUID, Foreign Key) - References roles(id)
- `invited_by` (UUID, Foreign Key) - References users(id)
- `invited_at`, `accepted_at` (TIMESTAMP)
- `created_at`, `updated_at` (TIMESTAMP)
- `row_version` (BIGINT) - Optimistic locking

### Roles (`roles`)
Custom RBAC system for permission management.

**Columns:**
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Unique) - Role identifier
- `description` (TEXT) - Role description
- `is_system_role` (BOOLEAN) - System vs custom role flag
- `created_at`, `updated_at` (TIMESTAMP)
- `row_version` (BIGINT) - Optimistic locking

### Permissions (`permissions`)
Defines what actions can be performed on what resources.

**Columns:**
- `id` (UUID, Primary Key)
- `action` (VARCHAR) - create, read, update, delete
- `resource` (VARCHAR) - user, team, inventory, etc.
- `location` (VARCHAR) - team, system, global
- `created_at`, `updated_at` (TIMESTAMP)
- `row_version` (BIGINT) - Optimistic locking

### Role Permissions (`role_permissions`)
Many-to-many relationship between roles and permissions.

**Columns:**
- `id` (UUID, Primary Key)
- `role_id` (UUID, Foreign Key) - References roles(id)
- `permission_id` (UUID, Foreign Key) - References permissions(id)
- `created_at` (TIMESTAMP)

### Audit Log (`audit_log`)
Comprehensive audit trail for all data changes.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key) - References users(id)
- `team_id` (UUID, Foreign Key) - References teams(id)
- `action` (ENUM) - create, update, delete, login, logout, permission_change
- `entity_type` (VARCHAR) - Table name
- `entity_id` (UUID) - Record ID
- `old_values` (JSONB) - Previous values
- `new_values` (JSONB) - New values
- `ip_address` (INET) - Client IP
- `user_agent` (TEXT) - Client user agent
- `created_at` (TIMESTAMP)

## Security Features

### Row-Level Security (RLS)
All tables have RLS enabled with policies that enforce:
- **Team isolation**: Users can only access data from their teams
- **Role-based access**: Permissions are enforced at the database level
- **Audit visibility**: Users can only see audit logs for their teams

### Audit Logging
Automatic audit triggers capture:
- All data changes (INSERT, UPDATE, DELETE)
- User context (who made the change)
- Team context (which team the change affects)
- Change details (old and new values)

### Optimistic Locking
All write-heavy tables use `row_version` for optimistic locking to prevent concurrent modification conflicts.

## Default Data

The system comes with pre-configured:

### Roles
- `super_admin` - Full system access
- `admin` - Team administrator
- `member` - Basic team member
- `viewer` - Read-only access

### Permissions
- User management (CRUD)
- Team management (system-level)
- Role management (team-level)
- Inventory management (basic CRUD)
- Audit log access (read-only)

## Usage Examples

### Creating a Team
```sql
INSERT INTO teams (name, slug, base_currency_code) 
VALUES ('Acme Corp', 'acme-corp', 'USD');
```

### Adding a User to a Team
```sql
INSERT INTO team_members (team_id, user_id, role_id, status)
VALUES (
    'team-uuid',
    'user-uuid', 
    (SELECT id FROM roles WHERE name = 'member'),
    'active'
);
```

### Checking Permissions
```sql
SELECT p.action, p.resource, p.location
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
JOIN team_members tm ON r.id = tm.role_id
WHERE tm.user_id = 'user-uuid' 
  AND tm.team_id = 'team-uuid'
  AND tm.status = 'active';
```

## Migration Commands

```bash
# Apply migrations
pnpm db:migrate

# Generate TypeScript types
pnpm db:types

# Check migration status
pnpm db:status

# Rollback last migration
pnpm db:rollback
```
