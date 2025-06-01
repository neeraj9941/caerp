import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { RolePermission } from '../types/user';

interface PermissionCache {
  [key: string]: {
    can_read: boolean;
    can_write: boolean;
    can_delete: boolean;
  };
}

export function usePermissions() {
  const { user, profile } = useAuth();
  const [permissions, setPermissions] = useState<PermissionCache>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!profile?.role) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select('*')
          .eq('role', profile.role);

        if (error) {
          console.error('Error fetching permissions:', error);
          return;
        }

        const permissionCache: PermissionCache = {};
        (data as RolePermission[]).forEach((permission) => {
          permissionCache[permission.module] = {
            can_read: permission.can_read,
            can_write: permission.can_write,
            can_delete: permission.can_delete,
          };
        });

        setPermissions(permissionCache);
      } catch (error) {
        console.error('Permission fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [profile?.role]);

  const can = (action: 'read' | 'write' | 'delete', module: string): boolean => {
    if (!profile?.role || profile.status === 'inactive') return false;
    
    // Super admin has all permissions
    if (profile.role === 'super_admin') return true;

    const modulePermissions = permissions[module];
    if (!modulePermissions) return false;

    switch (action) {
      case 'read':
        return modulePermissions.can_read;
      case 'write':
        return modulePermissions.can_write;
      case 'delete':
        return modulePermissions.can_delete;
      default:
        return false;
    }
  };

  return {
    can,
    loading,
    permissions
  };
} 