-- Initial seed data for Makerly SaaS
-- This file is executed after migrations during db reset

-- Insert default roles
INSERT INTO roles (name, description, is_system_role) VALUES
('super_admin', 'Super Administrator with full system access', true),
('admin', 'Team Administrator with full team access', false),
('member', 'Team Member with basic access', false),
('viewer', 'Team Viewer with read-only access', false)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (action, resource, location) VALUES
-- User management
('create', 'user', 'team'),
('read', 'user', 'team'),
('update', 'user', 'team'),
('delete', 'user', 'team'),

-- Team management
('create', 'team', 'system'),
('read', 'team', 'system'),
('update', 'team', 'system'),
('delete', 'team', 'system'),

-- Role management
('create', 'role', 'team'),
('read', 'role', 'team'),
('update', 'role', 'team'),
('delete', 'role', 'team'),

-- Inventory management (basic)
('create', 'inventory', 'team'),
('read', 'inventory', 'team'),
('update', 'inventory', 'team'),
('delete', 'inventory', 'team'),

-- Audit log access
('read', 'audit_log', 'team')
ON CONFLICT (action, resource, location) DO NOTHING;

-- Assign permissions to roles
-- Super Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Admin gets team-level permissions (except system-level team management)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin' 
  AND NOT (p.resource = 'team' AND p.location = 'system')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Member gets basic team permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'member' 
  AND p.action IN ('read', 'create', 'update')
  AND p.resource IN ('user', 'inventory')
  AND p.location = 'team'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Viewer gets read-only permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'viewer' 
  AND p.action = 'read'
  AND p.location = 'team'
ON CONFLICT (role_id, permission_id) DO NOTHING;
