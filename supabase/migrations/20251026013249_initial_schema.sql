-- Initial Schema Migration for Makerly SaaS
-- This migration creates the core tables for authentication, teams, and basic structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE team_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE member_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'permission_change');

-- Teams table (with I18N configuration)
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    status team_status DEFAULT 'active',
    
    -- I18N Configuration
    base_currency_code VARCHAR(3) DEFAULT 'USD',
    default_unit_family VARCHAR(50) DEFAULT 'metric',
    default_date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY',
    default_time_format VARCHAR(50) DEFAULT '12h',
    default_timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    row_version BIGINT DEFAULT 1
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    status user_status DEFAULT 'active',
    
    -- I18N Overrides (optional user-level overrides)
    override_unit_family VARCHAR(50),
    override_date_format VARCHAR(50),
    override_time_format VARCHAR(50),
    override_timezone VARCHAR(50),
    
    -- 2FA settings
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    row_version BIGINT DEFAULT 1
);

-- Team members table (many-to-many relationship with roles)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status member_status DEFAULT 'pending',
    
    -- Role assignment
    role_id UUID NOT NULL, -- Will reference roles table
    
    -- Invitation details
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    row_version BIGINT DEFAULT 1,
    
    UNIQUE(team_id, user_id)
);

-- Roles table (custom RBAC system)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    row_version BIGINT DEFAULT 1,
    
    UNIQUE(name)
);

-- Permissions table (action, resource, location scoping)
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(50) NOT NULL, -- create, read, update, delete
    resource VARCHAR(50) NOT NULL, -- user, team, inventory, etc.
    location VARCHAR(50) NOT NULL, -- team, system, global
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    row_version BIGINT DEFAULT 1,
    
    UNIQUE(action, resource, location)
);

-- Role permissions table (many-to-many)
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(role_id, permission_id)
);

-- Add foreign key constraint for team_members.role_id
ALTER TABLE team_members ADD CONSTRAINT fk_team_members_role_id 
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT;

-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    action audit_action NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_status ON team_members(status);
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_permissions_action_resource ON permissions(action, resource);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_team_id ON audit_log(team_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.row_version = OLD.row_version + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (user_id, team_id, action, entity_type, entity_id, new_values)
        VALUES (
            COALESCE(current_setting('app.current_user_id', true)::uuid, NULL),
            COALESCE(current_setting('app.current_team_id', true)::uuid, NULL),
            'create',
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (user_id, team_id, action, entity_type, entity_id, old_values, new_values)
        VALUES (
            COALESCE(current_setting('app.current_user_id', true)::uuid, NULL),
            COALESCE(current_setting('app.current_team_id', true)::uuid, NULL),
            'update',
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (user_id, team_id, action, entity_type, entity_id, old_values)
        VALUES (
            COALESCE(current_setting('app.current_user_id', true)::uuid, NULL),
            COALESCE(current_setting('app.current_team_id', true)::uuid, NULL),
            'delete',
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD)
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create audit triggers for all tables
CREATE TRIGGER audit_teams AFTER INSERT OR UPDATE OR DELETE ON teams
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_team_members AFTER INSERT OR UPDATE OR DELETE ON team_members
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_roles AFTER INSERT OR UPDATE OR DELETE ON roles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_permissions AFTER INSERT OR UPDATE OR DELETE ON permissions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_role_permissions AFTER INSERT OR UPDATE OR DELETE ON role_permissions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic multi-tenant isolation)
-- Teams: Users can only see teams they belong to
CREATE POLICY "Users can view teams they belong to" ON teams
    FOR SELECT USING (
        id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Users: Users can see other users in their teams
CREATE POLICY "Users can view team members" ON users
    FOR SELECT USING (
        id IN (
            SELECT user_id FROM team_members 
            WHERE team_id IN (
                SELECT team_id FROM team_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

-- Team members: Users can see team memberships for their teams
CREATE POLICY "Users can view team memberships" ON team_members
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Roles: All authenticated users can view roles
CREATE POLICY "Authenticated users can view roles" ON roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permissions: All authenticated users can view permissions
CREATE POLICY "Authenticated users can view permissions" ON permissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Role permissions: All authenticated users can view role permissions
CREATE POLICY "Authenticated users can view role permissions" ON role_permissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Audit log: Users can only see audit logs for their teams
CREATE POLICY "Users can view team audit logs" ON audit_log
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
