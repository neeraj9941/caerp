-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, disable RLS on all tables to avoid policy dependency issues
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies from profiles table
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
    -- Drop all policies from departments table
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'departments') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.departments', pol.policyname);
    END LOOP;
    -- Drop all policies from user_activity_logs table
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_activity_logs') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_activity_logs', pol.policyname);
    END LOOP;
    -- Drop all policies from role_permissions table
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'role_permissions') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.role_permissions', pol.policyname);
    END LOOP;
    -- Drop all policies from notifications table
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notifications') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', pol.policyname);
    END LOOP;
END $$;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.sessions;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
DROP TRIGGER IF EXISTS update_role_permissions_updated_at ON public.role_permissions;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_login() CASCADE;

-- Drop existing tables and types in correct order
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.user_activity_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.user_status CASCADE;

-- Create enum types
CREATE TYPE public.user_status AS ENUM ('active', 'inactive');
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'manager', 'staff', 'intern');

-- Create departments table first (since it's referenced by profiles)
CREATE TABLE public.departments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create profiles table with department reference
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email text,
    full_name text,
    mobile_number text,
    designation text,
    status public.user_status DEFAULT 'active',
    role public.user_role DEFAULT 'staff',
    department uuid REFERENCES public.departments(id) ON DELETE SET NULL,
    last_login_at timestamptz,
    last_login_ip text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user activity logs table
CREATE TABLE public.user_activity_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    action text NOT NULL,
    details jsonb,
    ip_address text,
    created_at timestamptz DEFAULT now()
);

-- Create role permissions table
CREATE TABLE public.role_permissions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    role public.user_role NOT NULL,
    module text NOT NULL,
    can_read boolean DEFAULT false,
    can_write boolean DEFAULT false,
    can_delete boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(role, module)
);

-- Create notifications table
CREATE TABLE public.notifications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Essential for SECURITY DEFINER functions
AS $$
DECLARE
    default_role public.user_role;
BEGIN
    -- Set default role
    default_role := 'staff'::public.user_role;

    -- Insert into public.profiles.
    -- This runs with the permissions of the function owner (e.g., 'postgres'),
    -- who should have BYPASSRLS or be covered by a specific policy.
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        default_role,
        'active'::public.user_status,
        NOW(),
        NOW()
    );

    -- Log the creation
    INSERT INTO public.user_activity_logs (
        user_id,
        action,
        details,
        ip_address -- Assuming NEW.x_real_ip or similar might be available if forwarded by auth
    ) VALUES (
        NEW.id,
        'user_created',
        jsonb_build_object(
            'email', NEW.email,
            'role', default_role
        ),
        inet_client_addr() -- Or NEW.ip if auth.users stores it, otherwise rely on request headers if possible
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[handle_new_user] Error: %', SQLERRM;
    -- Consider logging to a dedicated error table or re-raising for critical issues
    RETURN NEW; -- Still return NEW to not block user creation in auth.users
END;
$$;

-- Function to update last login
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.profiles
    SET
        last_login_at = now(),
        last_login_ip = inet_client_addr() -- Get IP from connection, or parse from headers if available
    WHERE id = NEW.user_id;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[handle_user_login] Error: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_login
    AFTER INSERT ON auth.sessions -- Assuming auth.sessions table exists and is used for login events
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON public.departments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_role_permissions_updated_at
    BEFORE UPDATE ON public.role_permissions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables (AFTER policies are defined, or at least be mindful of order)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Apply RLS Policies
DO $$
BEGIN
    -- PROFILES TABLE POLICIES

    -- Policy to allow the handle_new_user trigger (running as 'postgres' or function owner)
    -- to insert new profiles. This is crucial if BYPASSRLS isn't fully effective.
    EXECUTE format('
        CREATE POLICY "policy_trigger_allow_profile_creation" ON public.profiles
        FOR INSERT TO postgres -- Or the specific role that owns handle_new_user
        WITH CHECK (true)
    ');

    -- Users can read their own profile.
    EXECUTE format('
        CREATE POLICY "policy_user_read_own_profile" ON public.profiles
        FOR SELECT TO authenticated
        USING (id = auth.uid())
    ');

    -- Users can update their own profile.
    EXECUTE format('
        CREATE POLICY "policy_user_update_own_profile" ON public.profiles
        FOR UPDATE TO authenticated
        USING (id = auth.uid())
        WITH CHECK (id = auth.uid())
    ');

    -- Authenticated users can create their own profile entry if it matches their auth.uid().
    -- This might be used if client-side profile creation is also allowed,
    -- but primary creation is via trigger.
    EXECUTE format('
        CREATE POLICY "policy_user_insert_own_profile" ON public.profiles
        FOR INSERT TO authenticated
        WITH CHECK (id = auth.uid())
    ');

    -- Admins/Super Admins can manage all profiles.
    EXECUTE format('
        CREATE POLICY "policy_admin_manage_all_profiles" ON public.profiles
        FOR ALL TO authenticated -- Applies to SELECT, INSERT, UPDATE, DELETE
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = auth.uid() AND p.role IN (''super_admin''::public.user_role, ''admin''::public.user_role)
            )
        )
        WITH CHECK ( -- Also apply check for write operations
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = auth.uid() AND p.role IN (''super_admin''::public.user_role, ''admin''::public.user_role)
            )
        )
    ');

    -- DEPARTMENTS TABLE POLICIES
    EXECUTE format('
        CREATE POLICY "policy_admin_manage_departments" ON public.departments
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = auth.uid() AND p.role IN (''super_admin''::public.user_role, ''admin''::public.user_role)
            )
        )
        WITH CHECK (
             EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = auth.uid() AND p.role IN (''super_admin''::public.user_role, ''admin''::public.user_role)
            )
        )
    ');

    EXECUTE format('
        CREATE POLICY "policy_view_all_departments" ON public.departments
        FOR SELECT TO authenticated
        USING (true)
    ');

    -- USER_ACTIVITY_LOGS TABLE POLICIES
    EXECUTE format('
        CREATE POLICY "policy_user_view_own_activity_logs" ON public.user_activity_logs
        FOR SELECT TO authenticated
        USING (user_id = auth.uid())
    ');

    EXECUTE format('
        CREATE POLICY "policy_admin_view_all_activity_logs" ON public.user_activity_logs
        FOR SELECT TO authenticated -- Consider restricting further if needed
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = auth.uid() AND p.role = ''super_admin''::public.user_role
            )
        )
    ');
    -- Note: Inserting into user_activity_logs is handled by SECURITY DEFINER triggers.
    -- If direct insert by users is needed, a policy would be required here.

    -- ROLE_PERMISSIONS TABLE POLICIES
    EXECUTE format('
        CREATE POLICY "policy_admin_manage_role_permissions" ON public.role_permissions
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = auth.uid() AND p.role = ''super_admin''::public.user_role
            )
        )
         WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = auth.uid() AND p.role = ''super_admin''::public.user_role
            )
        )
    ');

    EXECUTE format('
        CREATE POLICY "policy_view_all_role_permissions" ON public.role_permissions
        FOR SELECT TO authenticated
        USING (true)
    ');

    -- NOTIFICATIONS TABLE POLICIES
    EXECUTE format('
        CREATE POLICY "policy_user_manage_own_notifications" ON public.notifications
        FOR ALL TO authenticated -- Allows select, insert, update, delete for own notifications
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid())
    ');

END $$;

-- Insert default role permissions
INSERT INTO public.role_permissions (role, module, can_read, can_write, can_delete)
SELECT r.role::public.user_role, m.module, r.default_read, r.default_write, r.default_delete
FROM (
    VALUES
        ('super_admin', true, true, true),
        ('admin', true, true, false),
        ('manager', true, true, false),
        ('staff', true, true, false),
        ('intern', true, false, false)
) AS r(role, default_read, default_write, default_delete)
CROSS JOIN (
    VALUES
        ('users'),
        ('clients'),
        ('tasks'),
        ('billing'),
        ('settings')
) AS m(module)
ON CONFLICT (role, module) DO NOTHING; 