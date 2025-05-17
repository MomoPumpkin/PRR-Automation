import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { 
  DocumentTextIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const AnalysisTypeCard = ({ type, title, description, icon: Icon, selected, onClick }) => {
  return (
    <div 
      className={`relative rounded-lg border ${
        selected ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-300'
      } bg-white p-4 shadow-sm cursor-pointer hover:border-primary-400 focus:outline-none`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
          selected ? 'bg-primary-100' : 'bg-gray-100'
        }`}>
          <Icon className={`h-6 w-6 ${selected ? 'text-primary-600' : 'text-gray-600'}`} aria-hidden="true" />
        </div>
        <div className="ml-4">
          <h3 className={`text-sm font-medium ${selected ? 'text-primary-900' : 'text-gray-900'}`}>{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      {selected && (
        <div className="absolute top-1 right-1">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600">
            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalysisCreate = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Check if file is an image
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg']
    },
    maxFiles: 1
  });

  const analysisTypes = [
    {
      id: 'all',
      title: 'Complete Analysis',
      description: 'Perform all three types of analysis at once (System Analysis, Destructive Testing, and PRR)',
      icon: CheckCircleIcon
    },
    {
      id: 'system_analysis',
      title: 'System Analysis',
      description: 'Comprehensive analysis of architecture components, reliability, scalability, and security',
      icon: DocumentTextIcon
    },
    {
      id: 'destructive_testing',
      title: 'Destructive Testing',
      description: 'Chaos testing plan with dependency analysis, test cases, and blast radius analysis',
      icon: ExclamationTriangleIcon
    },
    {
      id: 'prr',
      title: 'Production Reliability Review',
      description: 'Complete PRR document based on Google SRE model with recommendations',
      icon: ShieldCheckIcon
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedType) {
      setError('Please select an analysis type');
      return;
    }
    
    if (!file) {
      setError('Please upload an architecture diagram');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      if (description) {
        formData.append('description', description);
      }
      
      let response;
      
      // If "all" is selected, use the special endpoint
      if (selectedType === 'all') {
        // Submit to the "all" endpoint
        response = await axios.post('/api/analysis/all', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Navigate to the dashboard to see all analysis
        navigate('/analysis');
        return;
      } else {
        // For single analysis types
        formData.append('analysis_type', selectedType);
        
        // Submit to API
        response = await axios.post('/api/analysis', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Navigate to the analysis detail page
        navigate(`/analysis/${response.data.id}`);
      }
      
    } catch (err) {
      console.error('Error creating analysis:', err);
      setError(err.response?.data?.detail || 'Failed to create analysis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Analysis</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload an architecture diagram and select the type of analysis you want to perform.
          </p>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Analysis Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Analysis Type</label>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {analysisTypes.map((type) => (
                  <AnalysisTypeCard
                    key={type.id}
                    type={type.id}
                    title={type.title}
                    description={type.description}
                    icon={type.icon}
                    selected={selectedType === type.id}
                    onClick={() => setSelectedType(type.id)}
                  />
                ))}
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Describe the architecture and any specific concerns you want addressed"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Architecture Diagram</label>
              
              {!file ? (
                <div 
                  {...getRootProps()} 
                  className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 ${
                    isDragActive ? 'border-primary-500 bg-primary-50' : 'border-dashed'
                  } rounded-md cursor-pointer hover:border-primary-400`}
                >
                  <div className="space-y-1 text-center">
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload a file</span>
                        <input {...getInputProps()} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="mt-2 relative">
                  <div className="relative rounded-lg border border-gray-300 bg-white p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          src={preview}
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded-md"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{file.name}</h4>
                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="ml-4 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/analysis')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !file || !selectedType}
                className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  (isSubmitting || !file || !selectedType) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Create Analysis'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCreate;