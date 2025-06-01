import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  FileText, 
  FolderClosed, 
  UserCog, 
  Settings,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const location = useLocation();
  const { user, profile } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Compliance', href: '/compliance', icon: ClipboardCheck },
    { name: 'Tasks', href: '/tasks', icon: FileText },
    { name: 'Documents', href: '/documents', icon: FolderClosed },
    { name: 'Users', href: '/users', icon: UserCog },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" 
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out",
          open ? "w-64" : "w-20",
          "md:translate-x-0",
          !open && "md:w-20",
          !open && !open && "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
          <Link to="/" className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-blue-600 p-2 rounded-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              {open && (
                <span className="ml-2 text-xl font-semibold dark:text-white">
                  AccountPro
                </span>
              )}
            </div>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:block hidden rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {open ? (
              <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-200"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "flex-shrink-0 h-5 w-5 mr-3",
                      isActive
                        ? "text-blue-600 dark:text-blue-200"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  />
                  {open && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {open && (
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {profile?.full_name ? (
                    <span className="text-sm font-medium text-gray-600">
                      {profile.full_name.charAt(0)}
                    </span>
                  ) : (
                    <User className="h-4 w-4 text-gray-600" />
                  )}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {profile?.full_name || user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profile?.role || 'Loading...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;