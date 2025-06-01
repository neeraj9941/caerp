import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Clock, 
  AlertTriangle,
  FileCheck,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload
} from 'lucide-react';

// Mock client data
const mockClients = [
  { 
    id: '1', 
    name: 'ABC Corporation', 
    type: 'Private Limited', 
    pan: 'ABCDE1234F', 
    gstin: '27ABCDE1234F1Z5', 
    cin: 'U12345MH2010PTC123456',
    tan: 'MUMA12345B',
    contact: 'Rajesh Kumar', 
    designation: 'Director',
    phone: '+91 9876543210', 
    email: 'rajesh@abccorp.com',
    address: '123, Business Park, Andheri East, Mumbai - 400069',
    status: 'active',
    joinDate: '2023-01-15',
    services: ['GST Filing', 'Income Tax Filing', 'ROC Compliance', 'Accounting Services']
  },
  { 
    id: '2', 
    name: 'XYZ Enterprises', 
    type: 'Partnership', 
    pan: 'XYZAB5678G', 
    gstin: '27XYZAB5678G1Z3', 
    cin: '',
    tan: 'PUNA98765C',
    contact: 'Priya Sharma', 
    designation: 'Partner',
    phone: '+91 9876543211', 
    email: 'priya@xyzent.com',
    address: '456, Industrial Area, Phase II, Pune - 411057',
    status: 'active',
    joinDate: '2023-03-22',
    services: ['GST Filing', 'Income Tax Filing', 'Accounting Services']
  },
  { 
    id: '3', 
    name: 'Global Tech Solutions', 
    type: 'LLP', 
    pan: 'GTSPL9876H', 
    gstin: '27GTSPL9876H1Z7', 
    cin: 'AAA-1234',
    tan: 'BLRA45678D',
    contact: 'Vikram Patel', 
    designation: 'Managing Partner',
    phone: '+91 9876543212', 
    email: 'vikram@globaltech.com',
    address: '789, Tech Park, Electronic City, Bangalore - 560100',
    status: 'inactive',
    joinDate: '2022-11-10',
    services: ['GST Filing', 'Income Tax Filing', 'ROC Compliance']
  },
  { 
    id: '4', 
    name: 'Sunshine Industries', 
    type: 'Proprietorship', 
    pan: 'SUNIN4321J', 
    gstin: '27SUNIN4321J1Z9', 
    cin: '',
    tan: 'DELA12345E',
    contact: 'Anita Desai', 
    designation: 'Proprietor',
    phone: '+91 9876543213', 
    email: 'anita@sunshineindustries.com',
    address: '101, Market Complex, Karol Bagh, New Delhi - 110005',
    status: 'active',
    joinDate: '2023-05-05',
    services: ['GST Filing', 'Income Tax Filing']
  },
  { 
    id: '5', 
    name: 'Innovative Solutions', 
    type: 'Private Limited', 
    pan: 'INNOV5678K', 
    gstin: '27INNOV5678K1Z2', 
    cin: 'U67890MH2015PTC987654',
    tan: 'CHEA98765F',
    contact: 'Rahul Mehta', 
    designation: 'CEO',
    phone: '+91 9876543214', 
    email: 'rahul@innovativesol.com',
    address: '202, IT Park, Guindy, Chennai - 600032',
    status: 'active',
    joinDate: '2022-08-18',
    services: ['GST Filing', 'Income Tax Filing', 'ROC Compliance', 'Accounting Services', 'Tax Planning']
  },
];

// Mock tasks
const mockTasks = [
  { id: '1', clientId: '1', title: 'GST Filing - March 2025', deadline: '2025-04-20', status: 'pending', priority: 'high' },
  { id: '2', clientId: '1', title: 'TDS Return - Q4', deadline: '2025-04-30', status: 'pending', priority: 'medium' },
  { id: '3', clientId: '1', title: 'Annual ROC Filing', deadline: '2025-05-15', status: 'pending', priority: 'medium' },
  { id: '4', clientId: '1', title: 'GST Filing - February 2025', deadline: '2025-03-20', status: 'completed', priority: 'high' },
  { id: '5', clientId: '1', title: 'GST Filing - January 2025', deadline: '2025-02-20', status: 'completed', priority: 'high' },
];

// Mock documents
const mockDocuments = [
  { id: '1', clientId: '1', name: 'GST Registration Certificate', type: 'pdf', uploadDate: '2023-01-20', category: 'Registration' },
  { id: '2', clientId: '1', name: 'PAN Card', type: 'pdf', uploadDate: '2023-01-20', category: 'Registration' },
  { id: '3', clientId: '1', name: 'Certificate of Incorporation', type: 'pdf', uploadDate: '2023-01-20', category: 'Registration' },
  { id: '4', clientId: '1', name: 'Bank Statement - March 2025', type: 'pdf', uploadDate: '2025-04-05', category: 'Financial' },
  { id: '5', clientId: '1', name: 'Invoice Register - Q1 2025', type: 'xlsx', uploadDate: '2025-04-02', category: 'Financial' },
];

// Mock invoices
const mockInvoices = [
  { id: '1', clientId: '1', number: 'INV-2025-001', date: '2025-01-15', amount: 15000, status: 'paid' },
  { id: '2', clientId: '1', number: 'INV-2025-012', date: '2025-02-15', amount: 15000, status: 'paid' },
  { id: '3', clientId: '1', number: 'INV-2025-023', date: '2025-03-15', amount: 15000, status: 'pending' },
  { id: '4', clientId: '1', number: 'INV-2025-034', date: '2025-04-15', amount: 15000, status: 'pending' },
];

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Find client by ID
  const client = mockClients.find(c => c.id === id);
  
  if (!client) {
    return <div className="text-center py-10">Client not found</div>;
  }
  
  // Filter tasks, documents, and invoices for this client
  const clientTasks = mockTasks.filter(task => task.clientId === id);
  const clientDocuments = mockDocuments.filter(doc => doc.clientId === id);
  const clientInvoices = mockInvoices.filter(inv => inv.clientId === id);
  
  // Calculate statistics
  const pendingTasks = clientTasks.filter(task => task.status === 'pending').length;
  const completedTasks = clientTasks.filter(task => task.status === 'completed').length;
  const pendingInvoices = clientInvoices.filter(inv => inv.status === 'pending').length;
  const totalDocuments = clientDocuments.length;

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {client.type} • Client since {new Date(client.joinDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Edit className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
              Edit
            </button>
            <button className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              <Trash2 className="h-4 w-4 mr-2 text-red-500 dark:text-red-400" />
              Delete
            </button>
          </div>
        </div>
        
        {/* Client Stats */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-700">
            <div className="px-6 py-4 sm:p-4 text-center">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{pendingTasks}</dd>
            </div>
            <div className="px-6 py-4 sm:p-4 text-center">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Tasks</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{completedTasks}</dd>
            </div>
            <div className="px-6 py-4 sm:p-4 text-center">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Invoices</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{pendingInvoices}</dd>
            </div>
            <div className="px-6 py-4 sm:p-4 text-center">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Documents</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{totalDocuments}</dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'tasks', 'documents', 'invoices'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Information */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Client Information
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{client.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">PAN</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{client.pan}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">GSTIN</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{client.gstin}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CIN</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{client.cin || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">TAN</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{client.tan}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                    <dd className="mt-1 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {client.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-1 flex-shrink-0" />
                      <span>{client.address}</span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Contact Information
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {client.contact.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {client.contact}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {client.designation}
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-900 dark:text-white">{client.phone}</span>
                  </li>
                  <li className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-900 dark:text-white">{client.email}</span>
                  </li>
                </ul>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {client.services.map((service, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Tasks */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Recent Tasks
                </h3>
                <Link 
                  to="#"
                  onClick={() => setActiveTab('tasks')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {clientTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {task.status === 'completed' ? (
                          <FileCheck className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                        )}
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        }`}>
                          {task.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Deadline: {new Date(task.deadline).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Priority: {task.priority}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Invoices */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Recent Invoices
                </h3>
                <Link 
                  to="#"
                  onClick={() => setActiveTab('invoices')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {clientInvoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.number}
                      </p>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      }`}>
                        {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Date: {new Date(invoice.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{invoice.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Tasks
              </h3>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </button>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Task
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {clientTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {task.status === 'completed' ? (
                            <FileCheck className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {task.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(task.deadline).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.priority === 'high' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' 
                            : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        }`}>
                          {task.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Documents
              </h3>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Document
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {clientDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {doc.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {doc.type.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {doc.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                          <Download className="h-5 w-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Invoices
              </h3>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </button>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Invoice Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {clientInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.number}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        ₹{invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        }`}>
                          {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                          <Download className="h-5 w-5" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetails;