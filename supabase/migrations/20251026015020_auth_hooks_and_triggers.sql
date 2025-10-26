-- Authentication Hooks and Triggers
-- This migration sets up automatic user profile creation and authentication hooks

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile into our custom users table
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    avatar_url,
    timezone,
    locale,
    currency,
    date_format,
    time_format,
    unit_system,
    created_at,
    updated_at,
    version
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.avatar_url,
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC'),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en-US'),
    COALESCE(NEW.raw_user_meta_data->>'currency', 'USD'),
    COALESCE(NEW.raw_user_meta_data->>'date_format', 'MM/DD/YYYY'),
    COALESCE(NEW.raw_user_meta_data->>'time_format', '12h'),
    COALESCE(NEW.raw_user_meta_data->>'unit_system', 'imperial'),
    NOW(),
    NOW(),
    1
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user profile when auth.users is updated
  UPDATE public.users SET
    email = NEW.email,
    avatar_url = NEW.avatar_url,
    first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', first_name),
    last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', last_name),
    updated_at = NOW(),
    version = version + 1
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update user profile when auth.users is updated
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Soft delete user profile (set status to inactive)
  UPDATE public.users SET
    updated_at = NOW(),
    version = version + 1
  WHERE id = OLD.id;
  
  -- Soft delete team memberships
  UPDATE public.team_members SET
    status = 'inactive',
    updated_at = NOW(),
    version = version + 1
  WHERE user_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- Function to create default team for new users
CREATE OR REPLACE FUNCTION public.create_default_team_for_user()
RETURNS TRIGGER AS $$
DECLARE
  team_id UUID;
  member_role_id UUID;
BEGIN
  -- Create a default team for the user
  INSERT INTO public.teams (
    name,
    slug,
    description,
    base_currency,
    base_locale,
    base_timezone,
    base_date_format,
    base_time_format,
    base_unit_system,
    created_at,
    updated_at,
    version
  ) VALUES (
    COALESCE(NEW.first_name || ' ' || NEW.last_name, NEW.email) || '''s Team',
    LOWER(REGEXP_REPLACE(COALESCE(NEW.first_name || '-' || NEW.last_name, NEW.email), '[^a-zA-Z0-9-]', '-', 'g')),
    'Default team for ' || COALESCE(NEW.first_name || ' ' || NEW.last_name, NEW.email),
    NEW.currency,
    NEW.locale,
    NEW.timezone,
    NEW.date_format,
    NEW.time_format,
    NEW.unit_system,
    NOW(),
    NOW(),
    1
  ) RETURNING id INTO team_id;
  
  -- Get the member role ID
  SELECT id INTO member_role_id 
  FROM public.roles 
  WHERE name = 'member' AND is_system_role = true;
  
  -- Add user as team admin (first user in team becomes admin)
  INSERT INTO public.team_members (
    team_id,
    user_id,
    role_id,
    status,
    created_at,
    updated_at,
    version
  ) VALUES (
    team_id,
    NEW.id,
    member_role_id,
    'active',
    NOW(),
    NOW(),
    1
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default team for new users
DROP TRIGGER IF EXISTS on_user_created_create_team ON public.users;
CREATE TRIGGER on_user_created_create_team
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_team_for_user();

-- Function to enforce 2FA for super admin users
CREATE OR REPLACE FUNCTION public.enforce_2fa_for_super_admins()
RETURNS TRIGGER AS $$
DECLARE
  is_super_admin BOOLEAN;
BEGIN
  -- Check if user is a super admin
  SELECT EXISTS(
    SELECT 1 
    FROM public.team_members tm
    JOIN public.roles r ON tm.role_id = r.id
    WHERE tm.user_id = NEW.id 
      AND r.name = 'super_admin'
      AND tm.status = 'active'
  ) INTO is_super_admin;
  
  -- If user is super admin and doesn't have 2FA enabled, prevent login
  IF is_super_admin AND NOT EXISTS(
    SELECT 1 
    FROM auth.mfa_factors 
    WHERE user_id = NEW.id 
      AND status = 'verified'
  ) THEN
    RAISE EXCEPTION 'Super admin users must enable 2FA before logging in';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check 2FA requirement on login
CREATE OR REPLACE FUNCTION public.check_2fa_requirement()
RETURNS TRIGGER AS $$
DECLARE
  is_super_admin BOOLEAN;
BEGIN
  -- Check if user is a super admin
  SELECT EXISTS(
    SELECT 1 
    FROM public.team_members tm
    JOIN public.roles r ON tm.role_id = r.id
    WHERE tm.user_id = NEW.id 
      AND r.name = 'super_admin'
      AND tm.status = 'active'
  ) INTO is_super_admin;
  
  -- If user is super admin and doesn't have 2FA enabled, prevent login
  IF is_super_admin AND NOT EXISTS(
    SELECT 1 
    FROM auth.mfa_factors 
    WHERE user_id = NEW.id 
      AND status = 'verified'
  ) THEN
    RAISE EXCEPTION 'Super admin users must enable 2FA before logging in';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_user_update() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_user_delete() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_default_team_for_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_2fa_for_super_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_2fa_requirement() TO authenticated;
