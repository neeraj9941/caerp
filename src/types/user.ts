export type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff' | 'intern';
export type UserStatus = 'active' | 'inactive';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  mobile_number: string | null;
  designation: string | null;
  status: UserStatus;
  role: UserRole;
  department: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role: UserRole;
  module: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin/Partner',
  manager: 'Manager',
  staff: 'Staff/Executive',
  intern: 'Intern'
};

export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full access, manages users and settings',
  admin: 'Manages teams, clients, billing, compliance',
  manager: 'Assigns tasks, reviews work, approves leaves',
  staff: 'Works on tasks, timesheets, limited dashboard',
  intern: 'View-only or specific task permission'
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Active',
  inactive: 'Inactive'
}; 