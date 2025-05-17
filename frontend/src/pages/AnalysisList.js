import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  DocumentTextIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AnalysisList = () => {
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/analysis');
        setAnalysis(response.data);
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

  const getAnalysisTypeIcon = (type) => {
    switch (type) {
      case 'system_analysis':
        return <DocumentTextIcon className="h-6 w-6 text-green-600" />;
      case 'destructive_testing':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
      case 'prr':
        return <ShieldCheckIcon className="h-6 w-6 text-blue-600" />;
      default:
        return null;
    }
  };

  const getAnalysisTypeName = (type) => {
    switch (type) {
      case 'system_analysis':
        return 'System Analysis';
      case 'destructive_testing':
        return 'Destructive Testing';
      case 'prr':
        return 'Production Reliability Review';
      default:
        return '';
    }
  };

  const getAnalysisTypeColor = (type) => {
    switch (type) {
      case 'system_analysis':
        return 'bg-green-100 text-green-800';
      case 'destructive_testing':
        return 'bg-yellow-100 text-yellow-800';
      case 'prr':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedAnalysis = analysis
    .filter(analysis => {
      // Apply search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        analysis.file_name.toLowerCase().includes(searchLower) || 
        (analysis.description && analysis.description.toLowerCase().includes(searchLower));
      
      // Apply type filter
      const matchesType = filterType === 'all' || analysis.analysis_type === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.file_name.localeCompare(b.file_name)
          : b.file_name.localeCompare(a.file_name);
      } else if (sortBy === 'type') {
        return sortOrder === 'asc'
          ? a.analysis_type.localeCompare(b.analysis_type)
          : b.analysis_type.localeCompare(a.analysis_type);
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Analysis</h1>
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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-grow max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search analysis..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                Filters
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Analysis Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 ${
                        filterType === 'all' ? 'bg-gray-200' : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => handleFilterChange('all')}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 ${
                        filterType === 'system_analysis' ? 'bg-gray-200' : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => handleFilterChange('system_analysis')}
                    >
                      System Analysis
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 ${
                        filterType === 'destructive_testing' ? 'bg-gray-200' : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => handleFilterChange('destructive_testing')}
                    >
                      Destructive Testing
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 ${
                        filterType === 'prr' ? 'bg-gray-200' : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => handleFilterChange('prr')}
                    >
                      PRR
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <div className="flex items-center">
                    <select
                      id="sort-by"
                      name="sort-by"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      value={sortBy}
                      onChange={handleSortChange}
                    >
                      <option value="date">Date</option>
                      <option value="name">Name</option>
                      <option value="type">Type</option>
                    </select>
                    <button
                      type="button"
                      className="ml-2 p-2 text-gray-400 hover:text-gray-500"
                      onClick={handleSortOrderChange}
                    >
                      {sortOrder === 'asc' ? (
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <button
                  type="button"
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setSortBy('date');
                    setSortOrder('desc');
                  }}
                >
                  <XMarkIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading analysis...</p>
            </div>
          </div>
        ) : filteredAndSortedAnalysis.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <DocumentTextIcon className="h-12 w-12" aria-hidden="true" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No analysis found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating a new analysis'}
            </p>
            {!searchTerm && filterType === 'all' && (
              <div className="mt-6">
                <Link
                  to="/analysis/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New Analysis
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filteredAndSortedAnalysis.map((item) => (
                <li key={item.id}>
                  <Link to={`/analysis/${item.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getAnalysisTypeIcon(item.analysis_type)}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {item.file_name}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAnalysisTypeColor(item.analysis_type)}`}>
                                {getAnalysisTypeName(item.analysis_type)}
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
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisList;