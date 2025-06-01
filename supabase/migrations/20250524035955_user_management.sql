-- Create enum types
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'staff', 'intern');

-- Update profiles table with additional fields
ALTER TABLE profiles
  ADD COLUMN mobile_number text,
  ADD COLUMN designation text,
  ADD COLUMN status user_status DEFAULT 'active',
  ADD COLUMN role user_role DEFAULT 'staff',
  ADD COLUMN department text,
  ADD COLUMN last_login_at timestamptz,
  ADD COLUMN last_login_ip text;

-- Create departments table
CREATE TABLE departments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key to profiles for department
ALTER TABLE profiles
  ADD CONSTRAINT fk_department
  FOREIGN KEY (department)
  REFERENCES departments(id)
  ON DELETE SET NULL;

-- Create user activity logs table
CREATE TABLE user_activity_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  action text NOT NULL,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create role permissions table
CREATE TABLE role_permissions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  role user_role NOT NULL,
  module text NOT NULL,
  can_read boolean DEFAULT false,
  can_write boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(role, module)
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add RLS policies

-- Departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow super_admin and admin full access to departments"
  ON departments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Allow all users to view departments"
  ON departments
  FOR SELECT
  TO authenticated
  USING (true);

-- User Activity Logs
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all activity logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Role Permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow super_admin full access to role_permissions"
  ON role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Allow all users to view role_permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for departments
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Trigger for role_permissions
CREATE TRIGGER update_role_permissions_updated_at
  BEFORE UPDATE ON role_permissions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_logs (user_id, action, details)
  VALUES (auth.uid(), TG_ARGV[0], row_to_json(NEW));
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profile changes
CREATE TRIGGER log_profile_changes
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE log_user_activity('profile_updated');

-- Insert default role permissions
INSERT INTO role_permissions (role, module, can_read, can_write, can_delete) VALUES
  ('super_admin', 'users', true, true, true),
  ('super_admin', 'clients', true, true, true),
  ('super_admin', 'tasks', true, true, true),
  ('super_admin', 'billing', true, true, true),
  ('super_admin', 'settings', true, true, true),
  
  ('admin', 'users', true, true, false),
  ('admin', 'clients', true, true, true),
  ('admin', 'tasks', true, true, true),
  ('admin', 'billing', true, true, true),
  ('admin', 'settings', true, true, false),
  
  ('manager', 'users', true, false, false),
  ('manager', 'clients', true, true, false),
  ('manager', 'tasks', true, true, true),
  ('manager', 'billing', true, true, false),
  ('manager', 'settings', true, false, false),
  
  ('staff', 'users', true, false, false),
  ('staff', 'clients', true, true, false),
  ('staff', 'tasks', true, true, false),
  ('staff', 'billing', true, false, false),
  ('staff', 'settings', true, false, false),
  
  ('intern', 'users', true, false, false),
  ('intern', 'clients', true, false, false),
  ('intern', 'tasks', true, true, false),
  ('intern', 'billing', true, false, false),
  ('intern', 'settings', true, false, false); 