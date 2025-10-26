# Row-Level Security (RLS) Policies Documentation

This document describes the comprehensive Row-Level Security policies implemented for multi-tenant isolation in the Makerly SaaS platform.

## Overview

The RLS system provides:
- **Multi-tenant isolation** - Users can only access data from their teams
- **Role-based access control** - Permissions are enforced at the database level
- **Hierarchical permissions** - Super admins > Team admins > Members > Viewers
- **Audit protection** - Audit logs are read-only and team-scoped

## Helper Functions

### `user_has_permission(action, resource, location)`
Checks if the current user has a specific permission.

**Parameters:**
- `action` - The action (create, read, update, delete)
- `resource` - The resource (user, team, inventory, etc.)
- `location` - The scope (team, system, global)

**Returns:** `BOOLEAN`

### `user_is_team_admin(team_id)`
Checks if the current user is an admin of a specific team.

**Parameters:**
- `team_id` - The team UUID

**Returns:** `BOOLEAN`

### `user_is_super_admin()`
Checks if the current user has super admin privileges.

**Returns:** `BOOLEAN`

### `user_belongs_to_team(team_id)`
Checks if the current user belongs to a specific team.

**Parameters:**
- `team_id` - The team UUID

**Returns:** `BOOLEAN`

## Table Policies

### Teams Table

| Operation | Policy | Description |
|-----------|--------|-------------|
| SELECT | `teams_select_policy` | Users can view teams they belong to |
| INSERT | `teams_insert_policy` | Only super admins can create teams |
| UPDATE | `teams_update_policy` | Only super admins can update teams |
| DELETE | `teams_delete_policy` | Only super admins can delete teams |

### Users Table

| Operation | Policy | Description |
|-----------|--------|-------------|
| SELECT | `users_select_policy` | Users can view other users in their teams |
| UPDATE | `users_update_own_policy` | Users can update their own profile |
| UPDATE | `users_update_team_policy` | Team admins can update users in their teams |
| UPDATE | `users_update_super_admin_policy` | Super admins can update any user |
| DELETE | `users_delete_policy` | Only super admins can delete users |

### Team Members Table

| Operation | Policy | Description |
|-----------|--------|-------------|
| SELECT | `team_members_select_policy` | Users can view team memberships for their teams |
| INSERT | `team_members_insert_policy` | Team admins can add members to their teams |
| UPDATE | `team_members_update_policy` | Team admins can update memberships in their teams |
| DELETE | `team_members_delete_policy` | Team admins can remove members from their teams |
| INSERT | `team_members_super_admin_insert_policy` | Super admins can manage any team membership |
| UPDATE | `team_members_super_admin_update_policy` | Super admins can update any team membership |
| DELETE | `team_members_super_admin_delete_policy` | Super admins can remove any team membership |

### Roles Table

| Operation | Policy | Description |
|-----------|--------|-------------|
| SELECT | `roles_select_policy` | All authenticated users can view roles |
| INSERT | `roles_insert_policy` | Team admins can create custom roles (not system roles) |
| UPDATE | `roles_update_policy` | Team admins can update custom roles (not system roles) |
| DELETE | `roles_delete_policy` | Team admins can delete custom roles (not system roles) |

### Permissions Table

| Operation | Policy | Description |
|-----------|--------|-------------|
| SELECT | `permissions_select_policy` | All authenticated users can view permissions |
| INSERT | `permissions_insert_policy` | Only super admins can create permissions |
| UPDATE | `permissions_update_policy` | Only super admins can update permissions |
| DELETE | `permissions_delete_policy` | Only super admins can delete permissions |

### Role Permissions Table

| Operation | Policy | Description |
|-----------|--------|-------------|
| SELECT | `role_permissions_select_policy` | All authenticated users can view role permissions |
| INSERT | `role_permissions_insert_policy` | Team admins can manage permissions for custom roles |
| UPDATE | `role_permissions_update_policy` | Team admins can update permissions for custom roles |
| DELETE | `role_permissions_delete_policy` | Team admins can remove permissions from custom roles |

### Audit Log Table

| Operation | Policy | Description |
|-----------|--------|-------------|
| SELECT | `audit_log_select_policy` | Users can view audit logs for their teams |
| INSERT | `audit_log_insert_policy` | Only system can insert (via triggers) |

## Permission Hierarchy

### Super Admin
- **System-level access** - Can manage teams, users, and system roles
- **Global permissions** - Can access any team's data
- **System configuration** - Can manage permissions and system roles

### Team Admin
- **Team-level access** - Can manage users and roles within their teams
- **Custom roles** - Can create and manage custom roles for their team
- **Member management** - Can add/remove team members
- **User profiles** - Can update user profiles within their team

### Team Member
- **Basic access** - Can view team data and update their own profile
- **Limited permissions** - Cannot manage other users or roles

### Team Viewer
- **Read-only access** - Can only view team data
- **No modifications** - Cannot update any data

## Security Features

### Multi-Tenant Isolation
- Users can only access data from teams they belong to
- Cross-team data access is prevented at the database level
- Team boundaries are strictly enforced

### Role-Based Access Control
- Permissions are checked at the database level
- Role changes take effect immediately
- System roles are protected from modification

### Audit Protection
- Audit logs are read-only for users
- Only system triggers can insert audit records
- Users can only view audit logs for their teams

### Data Integrity
- Foreign key constraints prevent orphaned records
- Cascade deletes maintain referential integrity
- Optimistic locking prevents concurrent modification conflicts

## Testing RLS Policies

### Test User Access
```sql
-- Test if user can access team data
SELECT * FROM teams WHERE id = 'team-uuid';

-- Test if user can access other team's data (should return empty)
SELECT * FROM teams WHERE id = 'other-team-uuid';
```

### Test Permission Checking
```sql
-- Test if user has specific permission
SELECT user_has_permission('create', 'user', 'team');

-- Test if user is team admin
SELECT user_is_team_admin('team-uuid');

-- Test if user is super admin
SELECT user_is_super_admin();
```

### Test Role-Based Access
```sql
-- Test team admin permissions
SELECT * FROM team_members WHERE team_id = 'team-uuid';

-- Test member permissions (should only see their own teams)
SELECT * FROM team_members WHERE user_id = auth.uid();
```

## Best Practices

### Application Development
1. **Always use authenticated context** - Ensure users are logged in
2. **Check permissions before operations** - Use helper functions
3. **Handle permission errors gracefully** - Provide meaningful error messages
4. **Test with different roles** - Verify access controls work correctly

### Database Operations
1. **Use transactions** - Ensure data consistency
2. **Check RLS policies** - Verify they work as expected
3. **Monitor audit logs** - Track access patterns and issues
4. **Regular security reviews** - Audit permissions and access patterns

### User Management
1. **Principle of least privilege** - Give users minimum required access
2. **Regular access reviews** - Remove unnecessary permissions
3. **Role-based assignments** - Use roles instead of individual permissions
4. **Audit trail maintenance** - Keep audit logs for compliance

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check if user belongs to the team
   - Verify user has required role
   - Ensure RLS policies are active

2. **"Row not found" errors**
   - Check if RLS policies are filtering rows
   - Verify team membership status
   - Check if user has required permissions

3. **Performance issues**
   - Ensure proper indexes exist
   - Check if RLS policies are efficient
   - Monitor query execution plans

### Debugging Queries

```sql
-- Check current user context
SELECT auth.uid(), auth.role();

-- Check team memberships
SELECT * FROM team_members WHERE user_id = auth.uid();

-- Check user roles
SELECT r.name FROM roles r
JOIN team_members tm ON r.id = tm.role_id
WHERE tm.user_id = auth.uid() AND tm.status = 'active';

-- Check permissions
SELECT p.action, p.resource, p.location
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN team_members tm ON rp.role_id = tm.role_id
WHERE tm.user_id = auth.uid() AND tm.status = 'active';
```
