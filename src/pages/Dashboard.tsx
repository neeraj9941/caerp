import React from 'react';
import { 
  Users, 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  DollarSign,
  BarChart3,
  FileText
} from 'lucide-react';

const Dashboard: React.FC = () => {
  // Mock data
  const stats = [
    { name: 'Total Clients', value: '124', icon: Users, color: 'bg-blue-500' },
    { name: 'Pending Tasks', value: '28', icon: Clock, color: 'bg-yellow-500' },
    { name: 'Completed Tasks', value: '156', icon: FileCheck, color: 'bg-green-500' },
    { name: 'Compliance Alerts', value: '12', icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const upcomingDeadlines = [
    { client: 'ABC Corp', task: 'GST Filing', deadline: '2025-04-20', status: 'pending' },
    { client: 'XYZ Ltd', task: 'TDS Return', deadline: '2025-04-15', status: 'pending' },
    { client: 'Acme Inc', task: 'ITR Filing', deadline: '2025-04-30', status: 'pending' },
    { client: 'Global Tech', task: 'ROC Filing', deadline: '2025-04-25', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div 
            key={stat.name} 
            className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Upcoming Deadlines
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Tasks due in the next 30 days
              </p>
            </div>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {upcomingDeadlines.map((item, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.task}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.client}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        new Date(item.deadline) < new Date() 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      }`}>
                        {new Date(item.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Revenue Overview
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Financial performance this month
              </p>
            </div>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</span>
                <span className="text-lg font-medium text-gray-900 dark:text-white">₹1,245,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Outstanding</span>
                <span className="text-lg font-medium text-gray-900 dark:text-white">₹245,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Collected</span>
                <span className="text-lg font-medium text-gray-900 dark:text-white">₹1,000,000</span>
              </div>
              
              <div className="pt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Collection Rate</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">80%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Latest actions across the platform
            </p>
          </div>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {[
              { action: 'Document uploaded', user: 'Rahul Sharma', time: '2 hours ago', client: 'ABC Corp' },
              { action: 'Task completed', user: 'Priya Singh', time: '4 hours ago', client: 'XYZ Ltd' },
              { action: 'Client added', user: 'Admin User', time: '1 day ago', client: 'New Ventures Inc' },
              { action: 'Compliance filed', user: 'Vikram Patel', time: '2 days ago', client: 'Global Tech' },
            ].map((item, index) => (
              <li key={index} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.action}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.client} • {item.user}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;