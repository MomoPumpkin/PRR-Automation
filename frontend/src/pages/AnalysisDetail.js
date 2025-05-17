import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  DocumentTextIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import SystemAnalysisTemplate from '../templates/SystemAnalysisTemplate';
import DestructiveTestingTemplate from '../templates/DestructiveTestingTemplate';
import PRRTemplate from '../templates/PRRTemplate';

const AnalysisDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportFormat, setExportFormat] = useState('json');
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/analysis/${id}`);
        setAnalysis(response.data);
        setError(null);
        
        // Initialize expanded sections
        if (response.data.analysis_type === 'system_analysis') {
          setExpandedSections({
            raw_text: false
          });
        } else if (response.data.analysis_type === 'destructive_testing') {
          setExpandedSections({
            raw_text: false
          });
        } else if (response.data.analysis_type === 'prr') {
          setExpandedSections({
            raw_text: false
          });
        }
        
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError('Failed to fetch analysis details');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      const response = await axios.post(
        `/api/analysis/${id}/export`,
        new URLSearchParams({ format: exportFormat }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          responseType: 'blob',
        }
      );
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis-${id}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error exporting analysis:', err);
      setError('Failed to export analysis');
    } finally {
      setExportLoading(false);
      setShowExportOptions(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getAnalysisTypeIcon = () => {
    if (!analysis) return null;
    
    switch (analysis.analysis_type) {
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

  const getAnalysisTypeName = () => {
    if (!analysis) return '';
    
    switch (analysis.analysis_type) {
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

  const renderSystemAnalysisContent = () => {
    const result = analysis.result;
    const rawText = result.raw_text;
    const structuredData = result.structured_data;
    
    // Add raw_text to the structured data for more complete processing
    const enhancedData = {
      ...structuredData,
      raw_text: rawText
    };
    
    return (
      <div className="space-y-6">
        {/* Templated System Analysis */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">System Analysis</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <SystemAnalysisTemplate data={enhancedData} />
          </div>
        </div>
        
        {/* Raw Analysis Text */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div 
            className="px-4 py-5 sm:px-6 flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('raw_text')}
          >
            <h3 className="text-lg leading-6 font-medium text-gray-900">Raw Analysis Text</h3>
            {expandedSections.raw_text ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </div>
          {expandedSections.raw_text && (
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{rawText}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDestructiveTestingContent = () => {
    const result = analysis.result;
    const rawText = result.raw_text;
    const structuredData = result.structured_data;
    
    // Add raw_text to the structured data for more complete processing
    const enhancedData = {
      ...structuredData,
      raw_text: rawText
    };
    
    return (
      <div className="space-y-6">
        {/* Templated Destructive Testing */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Destructive Testing Plan</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <DestructiveTestingTemplate data={enhancedData} />
          </div>
        </div>
        
        {/* Raw Analysis Text */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div 
            className="px-4 py-5 sm:px-6 flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('raw_text')}
          >
            <h3 className="text-lg leading-6 font-medium text-gray-900">Raw Analysis Text</h3>
            {expandedSections.raw_text ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </div>
          {expandedSections.raw_text && (
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{rawText}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPRRContent = () => {
    const result = analysis.result;
    const rawText = result.raw_text;
    const structuredData = result.structured_data;
    
    // Add raw_text to the structured data for more complete processing
    const enhancedData = {
      ...structuredData,
      raw_text: rawText
    };
    
    return (
      <div className="space-y-6">
        {/* Templated PRR */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Production Reliability Review</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <PRRTemplate data={enhancedData} />
          </div>
        </div>
        
        {/* Raw Analysis Text */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div 
            className="px-4 py-5 sm:px-6 flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('raw_text')}
          >
            <h3 className="text-lg leading-6 font-medium text-gray-900">Raw PRR Document</h3>
            {expandedSections.raw_text ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </div>
          {expandedSections.raw_text && (
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{rawText}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAnalysisContent = () => {
    if (!analysis) return null;
    
    switch (analysis.analysis_type) {
      case 'system_analysis':
        return renderSystemAnalysisContent();
      case 'destructive_testing':
        return renderDestructiveTestingContent();
      case 'prr':
        return renderPRRContent();
      default:
        return (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Analysis Result</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{analysis.result.raw_text}</pre>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Not Found!</strong>
        <span className="block sm:inline"> The requested analysis could not be found.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="mr-4">
                {getAnalysisTypeIcon()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{analysis.file_name}</h2>
                <p className="text-sm text-gray-500">{getAnalysisTypeName()}</p>
              </div>
            </div>
            <div className="relative">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setShowExportOptions(!showExportOptions)}
              >
                <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
                Export
              </button>
              
              {showExportOptions && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setExportFormat('json');
                        handleExport();
                      }}
                    >
                      Export as JSON
                    </button>
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setExportFormat('pdf');
                        handleExport();
                      }}
                    >
                      Export as PDF
                    </button>
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setExportFormat('md');
                        handleExport();
                      }}
                    >
                      Export as Markdown
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            <span>Created on {new Date(analysis.created_at).toLocaleString()}</span>
          </div>
          
          {analysis.description && (
            <div className="mt-4 text-sm text-gray-500">
              <p>{analysis.description}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Analysis Content */}
      {renderAnalysisContent()}
    </div>
  );
};

export default AnalysisDetail;