import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import { useAuth } from '../auth';
import { Navigate } from 'react-router-dom';
import '../styles/history.css';
import { 
  History, 
  Search, 
  Trash2, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Loader,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // Filter states
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [selectedPrediction, setSelectedPrediction] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  
  const { user, isLoading: isAuthLoading, isAuthenticated, logout } = useAuth();
  const userRole = user?.role || 'Doctor';

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters();
  }, [history, searchTerm, selectedRiskLevel, selectedPrediction, dateRange]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(''); 
    try {
      const response = await fetch('http://localhost:5001/history', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          logout();
          return;
        }
        
        let errorMessage = 'Failed to fetch history';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setHistory(data.predictions || []);
    } catch (err) {
      console.error('Fetch history error:', err);
      setError(err.message || 'Error loading history');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.input_data.Patient_ID?.toLowerCase().includes(term) ||
        item.input_data.Patient_Name?.toLowerCase().includes(term)
      );
    }

    // Apply risk level filter
    if (selectedRiskLevel !== 'all') {
      filtered = filtered.filter(item => 
        item.risk_level.toLowerCase() === selectedRiskLevel.toLowerCase()
      );
    }

    // Apply prediction filter
    if (selectedPrediction !== 'all') {
      filtered = filtered.filter(item => 
        item.prediction.toLowerCase() === selectedPrediction.toLowerCase()
      );
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(item => 
            new Date(item.timestamp) >= filterDate
          );
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(item => 
            new Date(item.timestamp) >= filterDate
          );
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(item => 
            new Date(item.timestamp) >= filterDate
          );
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          filtered = filtered.filter(item => 
            new Date(item.timestamp) >= filterDate
          );
          break;
      }
    }

    setFilteredHistory(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedRiskLevel('all');
    setSelectedPrediction('all');
    setDateRange('all');
    setShowFilterDropdown(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    setDeleteLoading(id); 
    setError(''); 
    
    try {
      const response = await fetch(`http://localhost:5001/history/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          logout();
          return;
        }
        
        if (response.status === 404) {
          setError('Record not found or already deleted.');
          fetchHistory();
          return;
        }

        let errorMessage = 'Failed to delete record';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      setHistory(prev => prev.filter(item => item._id !== id));
      setError('');

    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Error deleting record');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Get unique values for filter options
  const getUniqueRiskLevels = () => {
    const levels = [...new Set(history.map(item => item.risk_level))];
    return levels.filter(Boolean);
  };

  const getUniquePredictions = () => {
    const predictions = [...new Set(history.map(item => item.prediction))];
    return predictions.filter(Boolean);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredHistory.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredHistory.length / recordsPerPage);

  if (isAuthLoading) {
    return (
      <div className="loading-container">
        <Loader className="loading-spinner" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar 
        userRole={userRole} 
        onLogout={logout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />
      
      <main className="main-content">
        <div className="history-container">
          <div className="history-header">
            <div className="header-content">
              <History className="header-icon" />
              <div>
                <h1>Prediction History</h1>
                <p>View and manage your previous predictions</p>
              </div>
            </div>
            
            <button 
              className="refresh-btn"
              onClick={fetchHistory}
              disabled={loading}
              title="Refresh history"
            >
              {loading ? <Loader size={18} /> : 'Refresh'}
            </button>
          </div>

          <div className="history-controls">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by Patient ID or Name..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <div className="filter-container">
              <button 
                className="filter-btn"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <Filter className="filter-icon" />
                <span>Filter</span>
                <ChevronDown size={16} />
              </button>
              
              {showFilterDropdown && (
                <div className="filter-dropdown">
                  <div className="filter-section">
                    <label>Risk Level:</label>
                    <select 
                      value={selectedRiskLevel} 
                      onChange={(e) => setSelectedRiskLevel(e.target.value)}
                    >
                      <option value="all">All Risk Levels</option>
                      {getUniqueRiskLevels().map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="filter-section">
                    <label>Prediction:</label>
                    <select 
                      value={selectedPrediction} 
                      onChange={(e) => setSelectedPrediction(e.target.value)}
                    >
                      <option value="all">All Predictions</option>
                      {getUniquePredictions().map(prediction => (
                        <option key={prediction} value={prediction}>{prediction}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="filter-section">
                    <label>Date Range:</label>
                    <select 
                      value={dateRange} 
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="year">Last Year</option>
                    </select>
                  </div>
                  
                  <div className="filter-actions">
                    <button 
                      className="clear-filters-btn"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
              
              <span className="filter-count">
                Showing {filteredHistory.length} of {history.length} records
              </span>
            </div>
          </div>

          {/* Active filters indicator */}
          {(searchTerm || selectedRiskLevel !== 'all' || selectedPrediction !== 'all' || dateRange !== 'all') && (
            <div className="active-filters">
              <span>Active filters:</span>
              {searchTerm && (
                <span className="filter-tag">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')}>×</button>
                </span>
              )}
              {selectedRiskLevel !== 'all' && (
                <span className="filter-tag">
                  Risk: {selectedRiskLevel}
                  <button onClick={() => setSelectedRiskLevel('all')}>×</button>
                </span>
              )}
              {selectedPrediction !== 'all' && (
                <span className="filter-tag">
                  Prediction: {selectedPrediction}
                  <button onClick={() => setSelectedPrediction('all')}>×</button>
                </span>
              )}
              {dateRange !== 'all' && (
                <span className="filter-tag">
                  Date: {dateRange}
                  <button onClick={() => setDateRange('all')}>×</button>
                </span>
              )}
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <AlertCircle className="alert-icon" />
              <div>
                <strong>Error:</strong> {error}
              </div>
              <button 
                onClick={() => setError('')}
                className="error-close-btn"
                title="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <Loader className="loading-spinner" />
              <p>Loading history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="empty-state">
              {history.length === 0 ? (
                <p>No prediction history found. Make your first prediction to see it here!</p>
              ) : (
                <p>No records match your current filters. Try adjusting your search criteria.</p>
              )}
            </div>
          ) : (
            <>
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Patient ID</th>
                      <th>Prediction</th>
                      <th>Risk Level</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record) => (
                      <tr key={record._id}>
                        <td>{record.input_data.Patient_Name}</td>
                        <td>{record.input_data.Patient_ID}</td>
                        <td>
                          <span className={`status-badge ${record.risk_level.toLowerCase()}`}>
                            {record.prediction}
                          </span>
                        </td>
                        <td>
                          <span className={`risk-level ${record.risk_level.toLowerCase()}`}>
                            {record.risk_level}
                          </span>
                        </td>
                        <td>{new Date(record.timestamp).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="details-btn"
                            onClick={() => setSelectedRecord(record)}
                            title="View details"
                          >
                            View Details
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete(record._id)}
                            disabled={deleteLoading === record._id}
                            title="Delete record"
                          >
                            {deleteLoading === record._id ? (
                              <Loader size={18} />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <span>Page {currentPage} of {totalPages}</span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {selectedRecord && (
                <div className="modal" onClick={() => setSelectedRecord(null)}>
                  <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <h2>Prediction Details</h2>
                      <button 
                        className="modal-close"
                        onClick={() => setSelectedRecord(null)}
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="modal-body">
                      <div className="details-grid">
                        {Object.entries(selectedRecord.input_data).map(([key, value]) => (
                          <div key={key} className="detail-item">
                           <strong>{key.replace(/_/g, ' ')}:</strong> <span className="value-style">{value}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="prediction-info">
                        <p><strong>Prediction:</strong> {selectedRecord.prediction}</p>
                        <p><strong>Risk Level:</strong> {selectedRecord.risk_level}</p>
                        <p><strong>Date:</strong> {new Date(selectedRecord.timestamp).toLocaleString()}</p>
                      </div>
                      
                      <div className="probabilities">
                        <h3>Prediction Probabilities</h3>
                        {Object.entries(selectedRecord.probabilities).map(([status, prob]) => (
                          <p key={status}>{status}: {(prob * 100).toFixed(2)}%</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;