-- I18N Infrastructure Migration for Makerly SaaS
-- This migration enhances the I18N system with comprehensive configuration tables and constraints

-- Create custom types for I18N
CREATE TYPE currency_code AS ENUM (
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD',
    'MXN', 'SGD', 'HKD', 'NOK', 'TRY', 'RUB', 'INR', 'BRL', 'ZAR', 'KRW'
);

CREATE TYPE unit_family AS ENUM ('metric', 'imperial', 'custom');

CREATE TYPE date_format AS ENUM (
    'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY',
    'MM.DD.YYYY', 'DD.MM.YYYY', 'YYYY/MM/DD', 'DD/MM/YY'
);

CREATE TYPE time_format AS ENUM ('12h', '24h');

-- Currency configuration table
CREATE TABLE currencies (
    code currency_code PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    decimal_places INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unit families and conversion rates
CREATE TABLE unit_families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    family_type unit_family NOT NULL,
    base_unit VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unit definitions within families
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES unit_families(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    conversion_factor DECIMAL(20, 10) NOT NULL, -- factor to convert to base unit
    is_base_unit BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timezone configuration
CREATE TABLE timezones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    utc_offset VARCHAR(10) NOT NULL, -- e.g., '+05:30', '-08:00'
    is_dst BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team I18N preferences (extends teams table)
CREATE TABLE team_i18n_preferences (
    team_id UUID PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,
    currency_code currency_code DEFAULT 'USD',
    unit_family unit_family DEFAULT 'metric',
    date_format date_format DEFAULT 'MM/DD/YYYY',
    time_format time_format DEFAULT '12h',
    timezone_id UUID REFERENCES timezones(id),
    number_format VARCHAR(20) DEFAULT 'en-US', -- e.g., 'en-US', 'de-DE', 'fr-FR'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User I18N preferences (extends users table)
CREATE TABLE user_i18n_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    currency_code currency_code, -- NULL means use team default
    unit_family unit_family, -- NULL means use team default
    date_format date_format, -- NULL means use team default
    time_format time_format, -- NULL means use team default
    timezone_id UUID REFERENCES timezones(id), -- NULL means use team default
    number_format VARCHAR(20), -- NULL means use team default
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints to existing tables
ALTER TABLE teams 
ADD CONSTRAINT teams_base_currency_code_check 
CHECK (base_currency_code IN ('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'TRY', 'RUB', 'INR', 'BRL', 'ZAR', 'KRW'));

ALTER TABLE teams 
ADD CONSTRAINT teams_default_unit_family_check 
CHECK (default_unit_family IN ('metric', 'imperial', 'custom'));

ALTER TABLE teams 
ADD CONSTRAINT teams_default_date_format_check 
CHECK (default_date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MM.DD.YYYY', 'DD.MM.YYYY', 'YYYY/MM/DD', 'DD/MM/YY'));

ALTER TABLE teams 
ADD CONSTRAINT teams_default_time_format_check 
CHECK (default_time_format IN ('12h', '24h'));

ALTER TABLE users 
ADD CONSTRAINT users_override_unit_family_check 
CHECK (override_unit_family IS NULL OR override_unit_family IN ('metric', 'imperial', 'custom'));

ALTER TABLE users 
ADD CONSTRAINT users_override_date_format_check 
CHECK (override_date_format IS NULL OR override_date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MM.DD.YYYY', 'DD.MM.YYYY', 'YYYY/MM/DD', 'DD/MM/YY'));

ALTER TABLE users 
ADD CONSTRAINT users_override_time_format_check 
CHECK (override_time_format IS NULL OR override_time_format IN ('12h', '24h'));

-- Create indexes for performance
CREATE INDEX idx_team_i18n_preferences_team_id ON team_i18n_preferences(team_id);
CREATE INDEX idx_user_i18n_preferences_user_id ON user_i18n_preferences(user_id);
CREATE INDEX idx_units_family_id ON units(family_id);
CREATE INDEX idx_units_is_base_unit ON units(is_base_unit);
CREATE INDEX idx_timezones_is_active ON timezones(is_active);

-- Insert default currencies
INSERT INTO currencies (code, name, symbol, decimal_places) VALUES
('USD', 'US Dollar', '$', 2),
('EUR', 'Euro', '€', 2),
('GBP', 'British Pound', '£', 2),
('JPY', 'Japanese Yen', '¥', 0),
('CAD', 'Canadian Dollar', 'C$', 2),
('AUD', 'Australian Dollar', 'A$', 2),
('CHF', 'Swiss Franc', 'CHF', 2),
('CNY', 'Chinese Yuan', '¥', 2),
('SEK', 'Swedish Krona', 'kr', 2),
('NZD', 'New Zealand Dollar', 'NZ$', 2),
('MXN', 'Mexican Peso', '$', 2),
('SGD', 'Singapore Dollar', 'S$', 2),
('HKD', 'Hong Kong Dollar', 'HK$', 2),
('NOK', 'Norwegian Krone', 'kr', 2),
('TRY', 'Turkish Lira', '₺', 2),
('RUB', 'Russian Ruble', '₽', 2),
('INR', 'Indian Rupee', '₹', 2),
('BRL', 'Brazilian Real', 'R$', 2),
('ZAR', 'South African Rand', 'R', 2),
('KRW', 'South Korean Won', '₩', 0);

-- Insert default unit families
INSERT INTO unit_families (name, family_type, base_unit) VALUES
('Length', 'metric', 'meter'),
('Weight', 'metric', 'kilogram'),
('Volume', 'metric', 'liter'),
('Temperature', 'metric', 'celsius'),
('Area', 'metric', 'square_meter'),
('Speed', 'metric', 'kilometer_per_hour');

-- Insert default units for Length (metric)
INSERT INTO units (family_id, name, symbol, conversion_factor, is_base_unit) VALUES
((SELECT id FROM unit_families WHERE name = 'Length'), 'millimeter', 'mm', 0.001, false),
((SELECT id FROM unit_families WHERE name = 'Length'), 'centimeter', 'cm', 0.01, false),
((SELECT id FROM unit_families WHERE name = 'Length'), 'meter', 'm', 1.0, true),
((SELECT id FROM unit_families WHERE name = 'Length'), 'kilometer', 'km', 1000.0, false);

-- Insert default units for Weight (metric)
INSERT INTO units (family_id, name, symbol, conversion_factor, is_base_unit) VALUES
((SELECT id FROM unit_families WHERE name = 'Weight'), 'gram', 'g', 0.001, false),
((SELECT id FROM unit_families WHERE name = 'Weight'), 'kilogram', 'kg', 1.0, true),
((SELECT id FROM unit_families WHERE name = 'Weight'), 'ton', 't', 1000.0, false);

-- Insert default units for Volume (metric)
INSERT INTO units (family_id, name, symbol, conversion_factor, is_base_unit) VALUES
((SELECT id FROM unit_families WHERE name = 'Volume'), 'milliliter', 'ml', 0.001, false),
((SELECT id FROM unit_families WHERE name = 'Volume'), 'liter', 'l', 1.0, true),
((SELECT id FROM unit_families WHERE name = 'Volume'), 'cubic_meter', 'm³', 1000.0, false);

-- Insert default units for Temperature (metric)
INSERT INTO units (family_id, name, symbol, conversion_factor, is_base_unit) VALUES
((SELECT id FROM unit_families WHERE name = 'Temperature'), 'celsius', '°C', 1.0, true),
((SELECT id FROM unit_families WHERE name = 'Temperature'), 'fahrenheit', '°F', 1.0, false), -- Special case for temperature
((SELECT id FROM unit_families WHERE name = 'Temperature'), 'kelvin', 'K', 1.0, false);

-- Insert default timezones
INSERT INTO timezones (name, utc_offset) VALUES
('UTC', '+00:00'),
('America/New_York', '-05:00'),
('America/Chicago', '-06:00'),
('America/Denver', '-07:00'),
('America/Los_Angeles', '-08:00'),
('Europe/London', '+00:00'),
('Europe/Paris', '+01:00'),
('Europe/Berlin', '+01:00'),
('Asia/Tokyo', '+09:00'),
('Asia/Shanghai', '+08:00'),
('Asia/Kolkata', '+05:30'),
('Australia/Sydney', '+10:00');

-- Create RLS policies for I18N tables
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE timezones ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_i18n_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_i18n_preferences ENABLE ROW LEVEL SECURITY;

-- Currencies: Read-only for all authenticated users
CREATE POLICY "currencies_read_all" ON currencies FOR SELECT USING (auth.role() = 'authenticated');

-- Unit families: Read-only for all authenticated users
CREATE POLICY "unit_families_read_all" ON unit_families FOR SELECT USING (auth.role() = 'authenticated');

-- Units: Read-only for all authenticated users
CREATE POLICY "units_read_all" ON units FOR SELECT USING (auth.role() = 'authenticated');

-- Timezones: Read-only for all authenticated users
CREATE POLICY "timezones_read_all" ON timezones FOR SELECT USING (auth.role() = 'authenticated');

-- Team I18N preferences: Team members can read, team admins can update
CREATE POLICY "team_i18n_preferences_read" ON team_i18n_preferences 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_members tm 
        WHERE tm.team_id = team_i18n_preferences.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.status = 'active'
    )
);

CREATE POLICY "team_i18n_preferences_update" ON team_i18n_preferences 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM team_members tm 
        JOIN roles r ON tm.role_id = r.id 
        WHERE tm.team_id = team_i18n_preferences.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.status = 'active'
        AND r.name IN ('admin', 'super_admin')
    )
);

-- User I18N preferences: Users can read and update their own preferences
CREATE POLICY "user_i18n_preferences_read" ON user_i18n_preferences 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_i18n_preferences_update" ON user_i18n_preferences 
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_i18n_preferences_insert" ON user_i18n_preferences 
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create audit triggers for I18N tables
CREATE OR REPLACE FUNCTION audit_i18n_changes()
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
CREATE TRIGGER audit_team_i18n_preferences_changes
    AFTER INSERT OR UPDATE OR DELETE ON team_i18n_preferences
    FOR EACH ROW EXECUTE FUNCTION audit_i18n_changes();

CREATE TRIGGER audit_user_i18n_preferences_changes
    AFTER INSERT OR UPDATE OR DELETE ON user_i18n_preferences
    FOR EACH ROW EXECUTE FUNCTION audit_i18n_changes();

-- Create helper functions for I18N operations
CREATE OR REPLACE FUNCTION get_user_i18n_preferences(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    user_prefs JSONB;
    team_prefs JSONB;
    result JSONB;
BEGIN
    -- Get user preferences
    SELECT to_jsonb(up.*) INTO user_prefs
    FROM user_i18n_preferences up
    WHERE up.user_id = user_uuid;
    
    -- Get team preferences (from user's primary team)
    SELECT to_jsonb(tip.*) INTO team_prefs
    FROM team_i18n_preferences tip
    JOIN team_members tm ON tip.team_id = tm.team_id
    WHERE tm.user_id = user_uuid 
    AND tm.status = 'active'
    LIMIT 1;
    
    -- Merge preferences (user overrides team defaults)
    result := COALESCE(team_prefs, '{}'::jsonb);
    
    IF user_prefs IS NOT NULL THEN
        result := result || user_prefs;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get effective currency for user
CREATE OR REPLACE FUNCTION get_user_currency(user_uuid UUID)
RETURNS currency_code AS $$
DECLARE
    user_currency currency_code;
    team_currency currency_code;
BEGIN
    -- Get user's currency preference
    SELECT currency_code INTO user_currency
    FROM user_i18n_preferences
    WHERE user_id = user_uuid;
    
    -- If user has no preference, get team default
    IF user_currency IS NULL THEN
        SELECT tip.currency_code INTO team_currency
        FROM team_i18n_preferences tip
        JOIN team_members tm ON tip.team_id = tm.team_id
        WHERE tm.user_id = user_uuid 
        AND tm.status = 'active'
        LIMIT 1;
        
        RETURN COALESCE(team_currency, 'USD');
    END IF;
    
    RETURN user_currency;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get effective unit family for user
CREATE OR REPLACE FUNCTION get_user_unit_family(user_uuid UUID)
RETURNS unit_family AS $$
DECLARE
    user_family unit_family;
    team_family unit_family;
BEGIN
    -- Get user's unit family preference
    SELECT unit_family INTO user_family
    FROM user_i18n_preferences
    WHERE user_id = user_uuid;
    
    -- If user has no preference, get team default
    IF user_family IS NULL THEN
        SELECT tip.unit_family INTO team_family
        FROM team_i18n_preferences tip
        JOIN team_members tm ON tip.team_id = tm.team_id
        WHERE tm.user_id = user_uuid 
        AND tm.status = 'active'
        LIMIT 1;
        
        RETURN COALESCE(team_family, 'metric');
    END IF;
    
    RETURN user_family;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
