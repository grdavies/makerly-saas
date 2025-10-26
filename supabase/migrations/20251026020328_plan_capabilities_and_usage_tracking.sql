-- Plan Capabilities and Usage Tracking Migration for Makerly SaaS
-- This migration creates the plan management system with capabilities, usage tracking, and grace windows

-- Create custom types for plan management
CREATE TYPE plan_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE capability_type AS ENUM ('boolean', 'numeric', 'metered');
CREATE TYPE usage_window_type AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE grace_window_status AS ENUM ('active', 'expired', 'used');

-- Plans table (syncs with Planship)
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planship_plan_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status plan_status DEFAULT 'active',
    price_monthly DECIMAL(10, 2),
    price_yearly DECIMAL(10, 2),
    currency_code VARCHAR(3) DEFAULT 'USD',
    trial_days INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plan capabilities (features and limits)
CREATE TABLE plan_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    capability_key VARCHAR(100) NOT NULL,
    capability_name VARCHAR(255) NOT NULL,
    capability_type capability_type NOT NULL,
    limit_value INTEGER, -- For numeric/metered capabilities
    is_enabled BOOLEAN DEFAULT TRUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(plan_id, capability_key)
);

-- Team subscriptions (links teams to plans)
CREATE TABLE team_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    planship_subscription_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id) -- One active subscription per team
);

-- Usage tracking with rolling windows
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    capability_key VARCHAR(100) NOT NULL,
    usage_value INTEGER NOT NULL DEFAULT 0,
    window_type usage_window_type NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    UNIQUE(team_id, capability_key, window_type, window_start)
);

-- Grace windows for plan limits
CREATE TABLE grace_windows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    capability_key VARCHAR(100) NOT NULL,
    grace_limit INTEGER NOT NULL,
    grace_period_days INTEGER NOT NULL DEFAULT 7,
    status grace_window_status DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plan change history
CREATE TABLE plan_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    from_plan_id UUID REFERENCES plans(id),
    to_plan_id UUID REFERENCES plans(id),
    change_type VARCHAR(50) NOT NULL, -- 'upgrade', 'downgrade', 'cancel', 'reactivate'
    change_reason TEXT,
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX idx_plans_status ON plans(status);
CREATE INDEX idx_plans_sort_order ON plans(sort_order);
CREATE INDEX idx_plan_capabilities_plan_id ON plan_capabilities(plan_id);
CREATE INDEX idx_plan_capabilities_key ON plan_capabilities(capability_key);
CREATE INDEX idx_team_subscriptions_team_id ON team_subscriptions(team_id);
CREATE INDEX idx_team_subscriptions_plan_id ON team_subscriptions(plan_id);
CREATE INDEX idx_team_subscriptions_status ON team_subscriptions(status);
CREATE INDEX idx_usage_tracking_team_id ON usage_tracking(team_id);
CREATE INDEX idx_usage_tracking_capability ON usage_tracking(capability_key);
CREATE INDEX idx_usage_tracking_window ON usage_tracking(window_type, window_start, window_end);
CREATE INDEX idx_grace_windows_team_id ON grace_windows(team_id);
CREATE INDEX idx_grace_windows_status ON grace_windows(status);
CREATE INDEX idx_grace_windows_expires ON grace_windows(expires_at);
CREATE INDEX idx_plan_change_history_team_id ON plan_change_history(team_id);
CREATE INDEX idx_plan_change_history_date ON plan_change_history(effective_date);

-- Insert default plans
INSERT INTO plans (planship_plan_id, name, description, price_monthly, price_yearly, sort_order) VALUES
('free', 'Free Plan', 'Perfect for getting started with basic inventory management', 0.00, 0.00, 1),
('starter', 'Starter Plan', 'Ideal for small businesses with growing inventory needs', 29.00, 290.00, 2),
('professional', 'Professional Plan', 'Advanced features for established businesses', 99.00, 990.00, 3),
('enterprise', 'Enterprise Plan', 'Full-featured solution for large organizations', 299.00, 2990.00, 4);

-- Insert default capabilities for each plan
-- Free Plan capabilities
INSERT INTO plan_capabilities (plan_id, capability_key, capability_name, capability_type, limit_value, is_enabled, description, sort_order) VALUES
((SELECT id FROM plans WHERE planship_plan_id = 'free'), 'inventory_items', 'Inventory Items', 'numeric', 100, true, 'Maximum number of inventory items', 1),
((SELECT id FROM plans WHERE planship_plan_id = 'free'), 'users', 'Team Members', 'numeric', 2, true, 'Maximum number of team members', 2),
((SELECT id FROM plans WHERE planship_plan_id = 'free'), 'api_calls', 'API Calls', 'metered', 1000, true, 'API calls per month', 3),
((SELECT id FROM plans WHERE planship_plan_id = 'free'), 'reports', 'Reports', 'boolean', null, true, 'Basic reporting features', 4),
((SELECT id FROM plans WHERE planship_plan_id = 'free'), 'integrations', 'Integrations', 'boolean', null, false, 'Third-party integrations', 5),
((SELECT id FROM plans WHERE planship_plan_id = 'free'), 'priority_support', 'Priority Support', 'boolean', null, false, 'Priority customer support', 6);

-- Starter Plan capabilities
INSERT INTO plan_capabilities (plan_id, capability_key, capability_name, capability_type, limit_value, is_enabled, description, sort_order) VALUES
((SELECT id FROM plans WHERE planship_plan_id = 'starter'), 'inventory_items', 'Inventory Items', 'numeric', 1000, true, 'Maximum number of inventory items', 1),
((SELECT id FROM plans WHERE planship_plan_id = 'starter'), 'users', 'Team Members', 'numeric', 5, true, 'Maximum number of team members', 2),
((SELECT id FROM plans WHERE planship_plan_id = 'starter'), 'api_calls', 'API Calls', 'metered', 10000, true, 'API calls per month', 3),
((SELECT id FROM plans WHERE planship_plan_id = 'starter'), 'reports', 'Reports', 'boolean', null, true, 'Advanced reporting features', 4),
((SELECT id FROM plans WHERE planship_plan_id = 'starter'), 'integrations', 'Integrations', 'boolean', null, true, 'Basic third-party integrations', 5),
((SELECT id FROM plans WHERE planship_plan_id = 'starter'), 'priority_support', 'Priority Support', 'boolean', null, true, 'Priority customer support', 6);

-- Professional Plan capabilities
INSERT INTO plan_capabilities (plan_id, capability_key, capability_name, capability_type, limit_value, is_enabled, description, sort_order) VALUES
((SELECT id FROM plans WHERE planship_plan_id = 'professional'), 'inventory_items', 'Inventory Items', 'numeric', 10000, true, 'Maximum number of inventory items', 1),
((SELECT id FROM plans WHERE planship_plan_id = 'professional'), 'users', 'Team Members', 'numeric', 25, true, 'Maximum number of team members', 2),
((SELECT id FROM plans WHERE planship_plan_id = 'professional'), 'api_calls', 'API Calls', 'metered', 100000, true, 'API calls per month', 3),
((SELECT id FROM plans WHERE planship_plan_id = 'professional'), 'reports', 'Reports', 'boolean', null, true, 'Advanced reporting with custom dashboards', 4),
((SELECT id FROM plans WHERE planship_plan_id = 'professional'), 'integrations', 'Integrations', 'boolean', null, true, 'Full third-party integrations', 5),
((SELECT id FROM plans WHERE planship_plan_id = 'professional'), 'priority_support', 'Priority Support', 'boolean', null, true, 'Priority customer support with SLA', 6),
((SELECT id FROM plans WHERE planship_plan_id = 'professional'), 'advanced_analytics', 'Advanced Analytics', 'boolean', null, true, 'Advanced analytics and insights', 7),
((SELECT id FROM plans WHERE planship_plan_id = 'professional'), 'custom_fields', 'Custom Fields', 'boolean', null, true, 'Custom field definitions', 8);

-- Enterprise Plan capabilities
INSERT INTO plan_capabilities (plan_id, capability_key, capability_name, capability_type, limit_value, is_enabled, description, sort_order) VALUES
((SELECT id FROM plans WHERE planship_plan_id = 'enterprise'), 'inventory_items', 'Inventory Items', 'numeric', 100000, true, 'Unlimited inventory items', 1),
((SELECT id FROM plans WHERE planship_plan_id = 'enterprise'), 'users', 'Team Members', 'numeric', 100, true, 'Maximum number of team members', 2),
((SELECT id FROM plans WHERE planship_plan_id = 'enterprise'), 'api_calls', 'API Calls', 'metered', 1000000, true, 'API calls per month', 3),
((SELECT id FROM plans WHERE planship_plan_id = 'enterprise'), 'reports', 'Reports', 'boolean', null, true, 'Enterprise reporting with white-labeling', 4),
((SELECT id FROM plans WHERE planship_plan_id = 'enterprise'), 'integrations', 'Integrations', 'boolean', null, true, 'Full third-party integrations + custom', 5),
((SELECT id FROM plans WHERE planship_plan_id = 'enterprise'), 'priority_support', 'Priority Support', 'boolean', null, true, 'Dedicated account manager', 6),
((SELECT id FROM plans WHERE planship_plan_id = 'enterprise'), 'advanced_analytics', 'Advanced Analytics', 'boolean', null, true, 'Advanced analytics with custom metrics', 7),
((SELECT id FROM plans WHERE planship_plan_id = 'enterprise'), 'custom_fields', 'Custom Fields', 'boolean', null, true, 'Unlimited custom field definitions', 8),
((SELECT id FROM plans WHERE planship_plan_id = 'enterprise'), 'sso', 'Single Sign-On', 'boolean', null, true, 'SSO integration', 9),
((SELECT id FROM plans WHERE planship_plan_id = 'enterprise'), 'audit_logs', 'Audit Logs', 'boolean', null, true, 'Comprehensive audit logging', 10),
((SELECT id FROM plans WHERE planship_plan_id = 'enterprise'), 'custom_branding', 'Custom Branding', 'boolean', null, true, 'White-label solution', 11);

-- Create RLS policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE grace_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_change_history ENABLE ROW LEVEL SECURITY;

-- Plans: Read-only for all authenticated users
CREATE POLICY "plans_read_all" ON plans FOR SELECT USING (auth.role() = 'authenticated');

-- Plan capabilities: Read-only for all authenticated users
CREATE POLICY "plan_capabilities_read_all" ON plan_capabilities FOR SELECT USING (auth.role() = 'authenticated');

-- Team subscriptions: Team members can read, team admins can update
CREATE POLICY "team_subscriptions_read" ON team_subscriptions 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_members tm 
        WHERE tm.team_id = team_subscriptions.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.status = 'active'
    )
);

CREATE POLICY "team_subscriptions_update" ON team_subscriptions 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM team_members tm 
        JOIN roles r ON tm.role_id = r.id 
        WHERE tm.team_id = team_subscriptions.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.status = 'active'
        AND r.name IN ('admin', 'super_admin')
    )
);

CREATE POLICY "team_subscriptions_insert" ON team_subscriptions 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM team_members tm 
        JOIN roles r ON tm.role_id = r.id 
        WHERE tm.team_id = team_subscriptions.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.status = 'active'
        AND r.name IN ('admin', 'super_admin')
    )
);

-- Usage tracking: Team members can read, system can insert/update
CREATE POLICY "usage_tracking_read" ON usage_tracking 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_members tm 
        WHERE tm.team_id = usage_tracking.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.status = 'active'
    )
);

CREATE POLICY "usage_tracking_insert" ON usage_tracking 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM team_members tm 
        WHERE tm.team_id = usage_tracking.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.status = 'active'
    )
);

CREATE POLICY "usage_tracking_update" ON usage_tracking 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM team_members tm 
        WHERE tm.team_id = usage_tracking.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.status = 'active'
    )
);

-- Grace windows: Team members can read, team admins can manage
CREATE POLICY "grace_windows_read" ON grace_windows 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_members tm 
        WHERE tm.team_id = grace_windows.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.status = 'active'
    )
);

CREATE POLICY "grace_windows_manage" ON grace_windows 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM team_members tm 
        JOIN roles r ON tm.role_id = r.id 
        WHERE tm.team_id = grace_windows.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.status = 'active'
        AND r.name IN ('admin', 'super_admin')
    )
);

-- Plan change history: Team members can read, team admins can insert
CREATE POLICY "plan_change_history_read" ON plan_change_history 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_members tm 
        WHERE tm.team_id = plan_change_history.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.status = 'active'
    )
);

CREATE POLICY "plan_change_history_insert" ON plan_change_history 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM team_members tm 
        JOIN roles r ON tm.role_id = r.id 
        WHERE tm.team_id = plan_change_history.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.status = 'active'
        AND r.name IN ('admin', 'super_admin')
    )
);

-- Create audit triggers
CREATE OR REPLACE FUNCTION audit_plan_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        user_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        auth.uid()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers
CREATE TRIGGER audit_team_subscriptions_changes
    AFTER INSERT OR UPDATE OR DELETE ON team_subscriptions
    FOR EACH ROW EXECUTE FUNCTION audit_plan_changes();

CREATE TRIGGER audit_plan_change_history_changes
    AFTER INSERT OR UPDATE OR DELETE ON plan_change_history
    FOR EACH ROW EXECUTE FUNCTION audit_plan_changes();

-- Helper functions for plan management
CREATE OR REPLACE FUNCTION get_team_plan(team_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    plan_data JSONB;
BEGIN
    SELECT to_jsonb(p.*) INTO plan_data
    FROM plans p
    JOIN team_subscriptions ts ON p.id = ts.plan_id
    WHERE ts.team_id = team_uuid
    AND ts.status = 'active'
    LIMIT 1;
    
    RETURN COALESCE(plan_data, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get team capabilities
CREATE OR REPLACE FUNCTION get_team_capabilities(team_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    capabilities JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'capability_key', pc.capability_key,
            'capability_name', pc.capability_name,
            'capability_type', pc.capability_type,
            'limit_value', pc.limit_value,
            'is_enabled', pc.is_enabled,
            'description', pc.description
        )
    ) INTO capabilities
    FROM plan_capabilities pc
    JOIN team_subscriptions ts ON pc.plan_id = ts.plan_id
    WHERE ts.team_id = team_uuid
    AND ts.status = 'active'
    AND pc.is_enabled = true;
    
    RETURN COALESCE(capabilities, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if team has capability
CREATE OR REPLACE FUNCTION team_has_capability(team_uuid UUID, capability_key VARCHAR(100))
RETURNS BOOLEAN AS $$
DECLARE
    has_capability BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM plan_capabilities pc
        JOIN team_subscriptions ts ON pc.plan_id = ts.plan_id
        WHERE ts.team_id = team_uuid
        AND ts.status = 'active'
        AND pc.capability_key = team_has_capability.capability_key
        AND pc.is_enabled = true
    ) INTO has_capability;
    
    RETURN has_capability;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get team usage for a capability
CREATE OR REPLACE FUNCTION get_team_usage(team_uuid UUID, capability_key VARCHAR(100), window_type usage_window_type)
RETURNS INTEGER AS $$
DECLARE
    usage_count INTEGER := 0;
    window_start TIMESTAMP WITH TIME ZONE;
    window_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate window boundaries
    CASE window_type
        WHEN 'daily' THEN
            window_start := date_trunc('day', NOW());
            window_end := window_start + INTERVAL '1 day';
        WHEN 'weekly' THEN
            window_start := date_trunc('week', NOW());
            window_end := window_start + INTERVAL '1 week';
        WHEN 'monthly' THEN
            window_start := date_trunc('month', NOW());
            window_end := window_start + INTERVAL '1 month';
        WHEN 'yearly' THEN
            window_start := date_trunc('year', NOW());
            window_end := window_start + INTERVAL '1 year';
    END CASE;
    
    -- Get usage count
    SELECT COALESCE(SUM(usage_value), 0) INTO usage_count
    FROM usage_tracking
    WHERE team_id = team_uuid
    AND capability_key = get_team_usage.capability_key
    AND window_type = get_team_usage.window_type
    AND window_start >= get_team_usage.window_start
    AND window_end <= get_team_usage.window_end;
    
    RETURN usage_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if team is within limits
CREATE OR REPLACE FUNCTION team_within_limits(team_uuid UUID, capability_key VARCHAR(100), window_type usage_window_type)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage INTEGER;
    limit_value INTEGER;
    within_limits BOOLEAN := TRUE;
BEGIN
    -- Get current usage
    SELECT get_team_usage(team_uuid, capability_key, window_type) INTO current_usage;
    
    -- Get limit
    SELECT pc.limit_value INTO limit_value
    FROM plan_capabilities pc
    JOIN team_subscriptions ts ON pc.plan_id = ts.plan_id
    WHERE ts.team_id = team_uuid
    AND ts.status = 'active'
    AND pc.capability_key = team_within_limits.capability_key
    AND pc.capability_type IN ('numeric', 'metered');
    
    -- Check if within limits
    IF limit_value IS NOT NULL AND current_usage >= limit_value THEN
        within_limits := FALSE;
    END IF;
    
    RETURN within_limits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
