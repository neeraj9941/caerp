import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Users,
  Building2,
  Activity,
  Clock,
  UserPlus,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  departments: number;
  recentLogins: number;
  newUsers: number;
  pendingApprovals: number;
}

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    departments: 0,
    recentLogins: 0,
    newUsers: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' });

        // Fetch active users
        const { count: activeUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .eq('status', 'active');

        // Fetch departments
        const { count: departments } = await supabase
          .from('departments')
          .select('*', { count: 'exact' });

        // Fetch recent logins (last 24 hours)
        const { count: recentLogins } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .gte('last_login_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        // Fetch new users (last 7 days)
        const { count: newUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        // Fetch pending approvals
        const { count: pendingApprovals } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .eq('status', 'inactive');

        setStats({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          departments: departments || 0,
          recentLogins: recentLogins || 0,
          newUsers: newUsers || 0,
          pendingApprovals: pendingApprovals || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, {profile?.full_name || 'Admin'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          color="bg-blue-600"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<UserCheck className="h-6 w-6 text-green-600" />}
          color="bg-green-600"
        />
        <StatCard
          title="Departments"
          value={stats.departments}
          icon={<Building2 className="h-6 w-6 text-purple-600" />}
          color="bg-purple-600"
        />
        <StatCard
          title="Recent Logins (24h)"
          value={stats.recentLogins}
          icon={<Activity className="h-6 w-6 text-yellow-600" />}
          color="bg-yellow-600"
        />
        <StatCard
          title="New Users (7d)"
          value={stats.newUsers}
          icon={<UserPlus className="h-6 w-6 text-indigo-600" />}
          color="bg-indigo-600"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon={<AlertCircle className="h-6 w-6 text-red-600" />}
          color="bg-red-600"
        />
      </div>

      {/* Add more dashboard sections here */}
    </div>
  );
};

export default AdminDashboard; 