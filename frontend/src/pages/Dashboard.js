import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, change, changeType }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
            <Icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {change && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <div className="flex items-center">
              {changeType === 'increase' ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`font-medium ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RecentAnalysisList = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Loading recent analysis...</p>
      </div>
    );
  }

  if (analysis.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No analysis found. Create your first analysis!</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {analysis.map((item) => (
          <li key={item.id}>
            <Link to={`/analysis/${item.id}`} className="block hover:bg-gray-50">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-primary-600">
                    {item.file_name}
                  </p>
                  <div className="ml-2 flex flex-shrink-0">
                    <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      item.analysis_type === 'system_analysis' 
                        ? 'bg-green-100 text-green-800' 
                        : item.analysis_type === 'destructive_testing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.analysis_type === 'system_analysis' 
                        ? 'System Analysis' 
                        : item.analysis_type === 'destructive_testing'
                        ? 'Destructive Testing'
                        : 'PRR'}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {item.description || 'No description'}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Created: {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalAnalysis: 0,
    systemAnalysis: 0,
    destructiveTests: 0,
    prrs: 0
  });

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/analysis');
        setAnalysis(response.data);
        
        // Calculate stats
        const total = response.data.length;
        const systemAnalysisCount = response.data.filter(a => a.analysis_type === 'system_analysis').length;
        const destructiveTestingCount = response.data.filter(a => a.analysis_type === 'destructive_testing').length;
        const prrCount = response.data.filter(a => a.analysis_type === 'prr').length;
        
        setStats({
          totalAnalysis: total,
          systemAnalysis: systemAnalysisCount,
          destructiveTests: destructiveTestingCount,
          prrs: prrCount
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError('Failed to fetch analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome, {currentUser?.full_name || currentUser?.username}</h1>
        <Link
          to="/analysis/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Analysis
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Analysis" 
          value={stats.totalAnalysis} 
          icon={DocumentTextIcon} 
        />
        <StatCard 
          title="System Analysis" 
          value={stats.systemAnalysis} 
          icon={ChartBarIcon} 
        />
        <StatCard 
          title="Destructive Tests" 
          value={stats.destructiveTests} 
          icon={ExclamationTriangleIcon} 
        />
        <StatCard 
          title="PRRs" 
          value={stats.prrs} 
          icon={ShieldCheckIcon} 
        />
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Analysis</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Your most recent architecture analysis</p>
          </div>
          <Link
            to="/analysis"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>
        <div className="border-t border-gray-200">
          <RecentAnalysisList analysis={analysis.slice(0, 5)} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;