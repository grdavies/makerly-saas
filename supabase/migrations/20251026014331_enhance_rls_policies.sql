-- Enhanced RLS Policies for Multi-Tenant Isolation
-- This migration adds comprehensive Row-Level Security policies for proper multi-tenant isolation

-- Drop existing policies to replace them with comprehensive ones
DROP POLICY IF EXISTS "Users can view teams they belong to" ON teams;
DROP POLICY IF EXISTS "Users can view team members" ON users;
DROP POLICY IF EXISTS "Users can view team memberships" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON roles;
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON permissions;
DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Users can view team audit logs" ON audit_log;

-- Helper function to check if user has permission for a specific action/resource/location
CREATE OR REPLACE FUNCTION user_has_permission(
    p_action TEXT,
    p_resource TEXT,
    p_location TEXT DEFAULT 'team'
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM team_members tm
        JOIN role_permissions rp ON tm.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE tm.user_id = auth.uid()
          AND tm.status = 'active'
          AND p.action = p_action
          AND p.resource = p_resource
          AND p.location = p_location
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is team admin
CREATE OR REPLACE FUNCTION user_is_team_admin(p_team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM team_members tm
        JOIN roles r ON tm.role_id = r.id
        WHERE tm.user_id = auth.uid()
          AND tm.team_id = p_team_id
          AND tm.status = 'active'
          AND r.name = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION user_is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM team_members tm
        JOIN roles r ON tm.role_id = r.id
        WHERE tm.user_id = auth.uid()
          AND tm.status = 'active'
          AND r.name = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user belongs to team
CREATE OR REPLACE FUNCTION user_belongs_to_team(p_team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM team_members tm
        WHERE tm.user_id = auth.uid()
          AND tm.team_id = p_team_id
          AND tm.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TEAMS TABLE POLICIES
-- Teams: Users can view teams they belong to
CREATE POLICY "teams_select_policy" ON teams
    FOR SELECT USING (user_belongs_to_team(id));

-- Teams: Only super admins can create teams
CREATE POLICY "teams_insert_policy" ON teams
    FOR INSERT WITH CHECK (user_is_super_admin());

-- Teams: Only super admins can update teams
CREATE POLICY "teams_update_policy" ON teams
    FOR UPDATE USING (user_is_super_admin());

-- Teams: Only super admins can delete teams
CREATE POLICY "teams_delete_policy" ON teams
    FOR DELETE USING (user_is_super_admin());

-- USERS TABLE POLICIES
-- Users: Users can view other users in their teams
CREATE POLICY "users_select_policy" ON users
    FOR SELECT USING (
        id IN (
            SELECT user_id FROM team_members 
            WHERE team_id IN (
                SELECT team_id FROM team_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

-- Users: Users can update their own profile
CREATE POLICY "users_update_own_policy" ON users
    FOR UPDATE USING (id = auth.uid());

-- Users: Team admins can update users in their teams
CREATE POLICY "users_update_team_policy" ON users
    FOR UPDATE USING (
        id IN (
            SELECT user_id FROM team_members tm
            WHERE tm.team_id IN (
                SELECT team_id FROM team_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
            AND user_is_team_admin(tm.team_id)
        )
    );

-- Users: Super admins can update any user
CREATE POLICY "users_update_super_admin_policy" ON users
    FOR UPDATE USING (user_is_super_admin());

-- Users: Only super admins can delete users
CREATE POLICY "users_delete_policy" ON users
    FOR DELETE USING (user_is_super_admin());

-- TEAM_MEMBERS TABLE POLICIES
-- Team members: Users can view team memberships for their teams
CREATE POLICY "team_members_select_policy" ON team_members
    FOR SELECT USING (user_belongs_to_team(team_id));

-- Team members: Team admins can manage memberships in their teams
CREATE POLICY "team_members_insert_policy" ON team_members
    FOR INSERT WITH CHECK (user_is_team_admin(team_id));

CREATE POLICY "team_members_update_policy" ON team_members
    FOR UPDATE USING (user_is_team_admin(team_id));

CREATE POLICY "team_members_delete_policy" ON team_members
    FOR DELETE USING (user_is_team_admin(team_id));

-- Team members: Super admins can manage any team membership
CREATE POLICY "team_members_super_admin_insert_policy" ON team_members
    FOR INSERT WITH CHECK (user_is_super_admin());

CREATE POLICY "team_members_super_admin_update_policy" ON team_members
    FOR UPDATE USING (user_is_super_admin());

CREATE POLICY "team_members_super_admin_delete_policy" ON team_members
    FOR DELETE USING (user_is_super_admin());

-- ROLES TABLE POLICIES
-- Roles: All authenticated users can view roles
CREATE POLICY "roles_select_policy" ON roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Roles: Team admins can create custom roles for their teams
CREATE POLICY "roles_insert_policy" ON roles
    FOR INSERT WITH CHECK (
        NOT is_system_role OR user_is_super_admin()
    );

-- Roles: Team admins can update custom roles (not system roles)
CREATE POLICY "roles_update_policy" ON roles
    FOR UPDATE USING (
        NOT is_system_role OR user_is_super_admin()
    );

-- Roles: Team admins can delete custom roles (not system roles)
CREATE POLICY "roles_delete_policy" ON roles
    FOR DELETE USING (
        NOT is_system_role OR user_is_super_admin()
    );

-- PERMISSIONS TABLE POLICIES
-- Permissions: All authenticated users can view permissions
CREATE POLICY "permissions_select_policy" ON permissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permissions: Only super admins can manage permissions
CREATE POLICY "permissions_insert_policy" ON permissions
    FOR INSERT WITH CHECK (user_is_super_admin());

CREATE POLICY "permissions_update_policy" ON permissions
    FOR UPDATE USING (user_is_super_admin());

CREATE POLICY "permissions_delete_policy" ON permissions
    FOR DELETE USING (user_is_super_admin());

-- ROLE_PERMISSIONS TABLE POLICIES
-- Role permissions: All authenticated users can view role permissions
CREATE POLICY "role_permissions_select_policy" ON role_permissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Role permissions: Team admins can manage role permissions for their teams
CREATE POLICY "role_permissions_insert_policy" ON role_permissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM roles r
            WHERE r.id = role_id
            AND (NOT r.is_system_role OR user_is_super_admin())
        )
    );

CREATE POLICY "role_permissions_update_policy" ON role_permissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM roles r
            WHERE r.id = role_id
            AND (NOT r.is_system_role OR user_is_super_admin())
        )
    );

CREATE POLICY "role_permissions_delete_policy" ON role_permissions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM roles r
            WHERE r.id = role_id
            AND (NOT r.is_system_role OR user_is_super_admin())
        )
    );

-- AUDIT_LOG TABLE POLICIES
-- Audit log: Users can only view audit logs for their teams
CREATE POLICY "audit_log_select_policy" ON audit_log
    FOR SELECT USING (
        team_id IS NULL OR user_belongs_to_team(team_id)
    );

-- Audit log: Only system can insert audit logs (via triggers)
CREATE POLICY "audit_log_insert_policy" ON audit_log
    FOR INSERT WITH CHECK (false);

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION user_has_permission(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_team_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION user_belongs_to_team(UUID) TO authenticated;
