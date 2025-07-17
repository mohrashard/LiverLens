import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth';
import Sidebar from '../components/sidebar';
import '../styles/uploadcsv.css'; 
import { 
  Upload, 
  FileText, 
  Loader, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  ChevronDown,
  Info,
  Database,
  Type,
  Hash,
  Calendar,
  User,
  Activity
} from 'lucide-react';

const UploadCSVPage = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [results, setResults] = useState([]);
  const [requirementsExpanded, setRequirementsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('columns');
  const navigate = useNavigate();

  // Column definitions with detailed information
  const columnDefinitions = [
    {
      name: 'Patient_Name',
      type: 'Text',
      description: 'Full name of the patient',
      example: 'John Doe',
      required: true
    },
    {
      name: 'Patient_ID',
      type: 'Text/Number',
      description: 'Unique identifier for the patient',
      example: 'P001, PAT_12345',
      required: true
    },
    {
      name: 'N_Days',
      type: 'Number',
      description: 'Number of days since diagnosis or treatment start',
      example: '365, 730, 1095',
      required: true
    },
    {
      name: 'Drug',
      type: 'Text',
      description: 'Type of medication or treatment',
      example: 'D-penicillamine, Placebo',
      required: true
    },
    {
      name: 'Age',
      type: 'Number',
      description: 'Patient age in years (0-150)',
      example: '45, 67, 23',
      required: true
    },
    {
      name: 'Sex',
      type: 'Text',
      description: 'Patient gender',
      example: 'M, F, Male, Female',
      required: true
    },
    {
      name: 'Ascites',
      type: 'Text',
      description: 'Presence of ascites (fluid in abdomen)',
      example: 'Y, N, Yes, No',
      required: true
    },
    {
      name: 'Hepatomegaly',
      type: 'Text',
      description: 'Liver enlargement status',
      example: 'Y, N, Yes, No',
      required: true
    },
    {
      name: 'Spiders',
      type: 'Text',
      description: 'Presence of spider angiomas',
      example: 'Y, N, Yes, No',
      required: true
    },
    {
      name: 'Edema',
      type: 'Text',
      description: 'Fluid retention/swelling status',
      example: 'Y, N, S (slight), Yes, No',
      required: true
    },
    {
      name: 'Bilirubin',
      type: 'Number',
      description: 'Serum bilirubin level (mg/dL)',
      example: '1.2, 2.8, 0.9',
      required: true
    },
    {
      name: 'Cholesterol',
      type: 'Number',
      description: 'Serum cholesterol level (mg/dL)',
      example: '200, 180, 250',
      required: true
    },
    {
      name: 'Albumin',
      type: 'Number',
      description: 'Serum albumin level (g/dL)',
      example: '3.5, 4.2, 2.8',
      required: true
    },
    {
      name: 'Copper',
      type: 'Number',
      description: 'Serum copper level (μg/dL)',
      example: '80, 120, 95',
      required: true
    },
    {
      name: 'Alk_Phos',
      type: 'Number',
      description: 'Alkaline phosphatase level (U/L)',
      example: '120, 180, 95',
      required: true
    },
    {
      name: 'SGOT',
      type: 'Number',
      description: 'Serum glutamic-oxaloacetic transaminase (U/L)',
      example: '45, 60, 35',
      required: true
    },
    {
      name: 'Tryglicerides',
      type: 'Number',
      description: 'Serum triglycerides level (mg/dL)',
      example: '150, 200, 100',
      required: true
    },
    {
      name: 'Platelets',
      type: 'Number',
      description: 'Platelet count (×10³/μL)',
      example: '250, 300, 180',
      required: true
    },
    {
      name: 'Prothrombin',
      type: 'Number',
      description: 'Prothrombin time (seconds)',
      example: '12.5, 15.2, 11.8',
      required: true
    },
    {
      name: 'Stage',
      type: 'Number',
      description: 'Disease stage (1-4)',
      example: '1, 2, 3, 4',
      required: true
    }
  ];

  // Sample data for the modern table
  const sampleData = [
    {
      Patient_Name: 'John Doe',
      Patient_ID: 'P001',
      N_Days: 365,
      Drug: 'D-penicillamine',
      Age: 45,
      Sex: 'M',
      Ascites: 'N',
      Hepatomegaly: 'Y',
      Spiders: 'N',
      Edema: 'N',
      Bilirubin: 1.2,
      Cholesterol: 200,
      Albumin: 3.5,
      Copper: 80,
      Alk_Phos: 120,
      SGOT: 45,
      Tryglicerides: 150,
      Platelets: 250,
      Prothrombin: 12.5,
      Stage: 2
    },
    {
      Patient_Name: 'Jane Smith',
      Patient_ID: 'P002',
      N_Days: 730,
      Drug: 'Placebo',
      Age: 52,
      Sex: 'F',
      Ascites: 'Y',
      Hepatomegaly: 'N',
      Spiders: 'Y',
      Edema: 'S',
      Bilirubin: 2.8,
      Cholesterol: 180,
      Albumin: 2.8,
      Copper: 120,
      Alk_Phos: 180,
      SGOT: 60,
      Tryglicerides: 200,
      Platelets: 180,
      Prothrombin: 15.2,
      Stage: 3
    },
    {
      Patient_Name: 'Bob Johnson',
      Patient_ID: 'P003',
      N_Days: 1095,
      Drug: 'D-penicillamine',
      Age: 38,
      Sex: 'M',
      Ascites: 'N',
      Hepatomegaly: 'N',
      Spiders: 'N',
      Edema: 'N',
      Bilirubin: 0.9,
      Cholesterol: 250,
      Albumin: 4.2,
      Copper: 95,
      Alk_Phos: 95,
      SGOT: 35,
      Tryglicerides: 100,
      Platelets: 300,
      Prothrombin: 11.8,
      Stage: 1
    }
  ];

  if (isAuthLoading) {
    return (
      <div className="loading-container">
        <Loader className="loading-spinner" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (user?.role !== 'Doctor') {
    return (
      <div className="app-container">
        <Sidebar userRole={user?.role} />
        <main className="main-content">
          <div className="upload-csv-unauthorized-container">
            <AlertCircle size={48} className="upload-csv-unauthorized-icon" />
            <h2>Access Denied</h2>
            <p>This feature is only available to doctors.</p>
          </div>
        </main>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setError('');
      setSuccess('');
      setResults([]);
    } else {
      setError('Please select a valid CSV file');
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a CSV file first');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('csv_file', selectedFile);

    try {
      const response = await axios.post(
        'http://localhost:5001/predict/bulk',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      if (response.data && Array.isArray(response.data.predictions)) {
        setResults(response.data.predictions);
        setSuccess(`${response.data.predictions.length} predictions processed successfully`);
      } else {
        setError('Unexpected response format from server');
      }
    } catch (err) {
      console.error('Bulk prediction error:', err);
      setError(err.response?.data?.error || 'Failed to process CSV file');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResults = () => {
    if (results.length === 0) return;
    
    const headers = Object.keys(results[0]).join(',');
    const rows = results.map(result => 
      Object.values(result).map(value => 
        `"${value.toString().replace(/"/g, '""')}"`
      ).join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `liverlens_predictions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTemplate = () => {
    const headers = columnDefinitions.map(col => col.name).join(',');
    const exampleRow = columnDefinitions.map(col => col.example.split(',')[0]).join(',');
    const csvContent = `${headers}\n${exampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'liverlens_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setError('');
    setSuccess('');
    setResults([]);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Text': return <Type size={14} />;
      case 'Number': return <Hash size={14} />;
      case 'Text/Number': return <Database size={14} />;
      default: return <Info size={14} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar userRole={user?.role} />
      
      <main className="main-content upload-csv-page">
        <div className="upload-csv-container">
          <div className="upload-csv-header">
            <div className="upload-csv-header-content">
              <Upload className="upload-csv-header-icon" />
              <div>
                <h1>Bulk Prediction</h1>
                <p>Upload a CSV file to process multiple patients at once</p>
              </div>
            </div>
          </div>

          {/* Column Requirements Section */}
          <div className="upload-csv-column-requirements">
            <div 
              className="upload-csv-requirements-header"
              onClick={() => setRequirementsExpanded(!requirementsExpanded)}
            >
              <div className="upload-csv-requirements-header-content">
                <Info className="upload-csv-requirements-icon" />
                <div>
                  <h3 className="upload-csv-requirements-title">CSV Format Requirements</h3>
                  <p className="upload-csv-requirements-subtitle">
                    Click to view required columns and data formats
                  </p>
                </div>
              </div>
              <ChevronDown 
                className={`upload-csv-toggle-icon ${requirementsExpanded ? 'expanded' : ''}`}
              />
            </div>
            
            <div className={`upload-csv-requirements-content ${requirementsExpanded ? 'expanded' : ''}`}>
              <div className="upload-csv-requirements-tabs">
                <button 
                  className={`upload-csv-tab-button ${activeTab === 'columns' ? 'active' : ''}`}
                  onClick={() => setActiveTab('columns')}
                >
                  <Database size={16} />
                  Column Details
                </button>
                <button 
                  className={`upload-csv-tab-button ${activeTab === 'example' ? 'active' : ''}`}
                  onClick={() => setActiveTab('example')}
                >
                  <FileText size={16} />
                  CSV Example
                </button>
                <button 
                  className={`upload-csv-tab-button ${activeTab === 'template' ? 'active' : ''}`}
                  onClick={() => setActiveTab('template')}
                >
                  <Download size={16} />
                  Download Template
                </button>
              </div>

              <div className={`upload-csv-tab-content ${activeTab === 'columns' ? 'active' : ''}`}>
                <div className="upload-csv-columns-grid">
                  {columnDefinitions.map((column, index) => (
                    <div key={index} className="upload-csv-column-card">
                      <div className="upload-csv-column-name">
                        {getTypeIcon(column.type)}
                        {column.name}
                        <span className="upload-csv-column-type">{column.type}</span>
                      </div>
                      <div className="upload-csv-column-description">{column.description}</div>
                      <div className="upload-csv-column-example">
                        <strong>Examples:</strong> {column.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`upload-csv-tab-content ${activeTab === 'example' ? 'active' : ''}`}>
                <div className="upload-csv-format-example">
                  <h4>Sample CSV Format:</h4>
                  <div className="upload-csv-preview">
                    <table className="upload-csv-table">
                      <thead>
                        <tr>
                          {columnDefinitions.map((col, index) => (
                            <th key={index}>{col.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sampleData.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {columnDefinitions.map((col, colIndex) => (
                              <td key={colIndex}>
                                {typeof row[col.name] === 'number' ? row[col.name] : row[col.name]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className={`upload-csv-tab-content ${activeTab === 'template' ? 'active' : ''}`}>
                <div className="upload-csv-format-example">
                  <h4>Download CSV Template:</h4>
                  <p style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
                    Download a pre-formatted CSV template with the correct column headers and sample data.
                  </p>
                  <button 
                    onClick={downloadTemplate}
                    className="upload-csv-download-template"
                  >
                    <Download size={16} />
                    Download Template
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Form */}
          <div className="upload-csv-form-container">
            <form onSubmit={handleSubmit} className="upload-csv-form">
              <div className="upload-csv-file-input-container">
                <label className={`upload-csv-file-input-label ${selectedFile ? 'file-selected' : ''}`}>
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={handleFileChange}
                    className="upload-csv-file-input"
                  />
                  <div className="upload-csv-file-input-content">
                    <Upload className="upload-csv-upload-icon" />
                    <p>
                      {selectedFile ? (
                        <>
                          <strong>{selectedFile.name}</strong>
                          <br />
                          <span style={{ fontSize: '0.875rem', color: '#10b981' }}>
                            File selected successfully
                          </span>
                        </>
                      ) : (
                        'Select CSV file or drag and drop'
                      )}
                    </p>
                    <span className="upload-csv-browse-button">
                      {selectedFile ? 'Change File' : 'Browse Files'}
                    </span>
                  </div>
                </label>
                
                <div className="upload-csv-file-requirements">
                  <FileText size={16} className="upload-csv-file-requirements-icon" />
                  <div>
                    <strong>Requirements:</strong> CSV format only with all required columns. 
                    Maximum file size: 10MB. Ensure data matches the format specified above.
                  </div>
                </div>
              </div>

              <div className="upload-csv-form-actions">
                <button 
                  type="submit" 
                  disabled={!selectedFile || isLoading}
                  className="upload-csv-btn-primary"
                >
                  {isLoading ? (
                    <>
                      <Loader className="upload-csv-btn-icon upload-csv-spinning" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Activity className="upload-csv-btn-icon" />
                      Process File
                    </>
                  )}
                </button>
                
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="upload-csv-btn-secondary"
                >
                  <AlertCircle className="upload-csv-btn-icon" />
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="upload-csv-alert upload-csv-alert-error">
              <AlertCircle className="upload-csv-alert-icon" />
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="upload-csv-alert upload-csv-alert-success">
              <CheckCircle className="upload-csv-alert-icon" />
              <div>
                <strong>Success:</strong> {success}
              </div>
            </div>
          )}

          {/* Results Section */}
          {results.length > 0 && (
            <div className="upload-csv-results-container">
              <div className="upload-csv-results-header">
                <div>
                  <h3>Prediction Results</h3>
                  <p>{results.length} predictions processed successfully</p>
                </div>
                <button 
                  onClick={downloadResults}
                  className="upload-csv-btn-download"
                >
                  <Download size={18} />
                  Download Results
                </button>
              </div>
              
              <div className="upload-csv-results-table-container">
                <table className="upload-csv-results-table">
                  <thead>
                    <tr>
                      {Object.keys(results[0]).map((key) => (
                        <th key={key}>{key.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, idx) => (
                          <td key={idx}>
                            {typeof value === 'number' ? value.toFixed(3) : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UploadCSVPage;