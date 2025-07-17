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
  ChevronDown,
  Calendar,
  X,
  CheckSquare,
  Square
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
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Bulk delete states
  const [selectedRecords, setSelectedRecords] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  
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
  }, [history, searchTerm, selectedRiskLevel, selectedPrediction, dateRange, customDateRange]);

  // Update select all when filtered history changes
  useEffect(() => {
    if (selectAll && filteredHistory.length > 0) {
      setSelectedRecords(new Set(filteredHistory.map(record => record._id)));
    } else if (!selectAll) {
      setSelectedRecords(new Set());
    }
  }, [selectAll, filteredHistory]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(''); 
    try {
      // Fetch all records at once by requesting a large page size
      const response = await fetch('http://localhost:5001/history?per_page=1000&page=1', {
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
        case 'custom':
          if (customDateRange.startDate || customDateRange.endDate) {
            filtered = filtered.filter(item => {
              const itemDate = new Date(item.timestamp);
              let isValid = true;
              
              if (customDateRange.startDate) {
                const startDate = new Date(customDateRange.startDate);
                startDate.setHours(0, 0, 0, 0);
                isValid = isValid && itemDate >= startDate;
              }
              
              if (customDateRange.endDate) {
                const endDate = new Date(customDateRange.endDate);
                endDate.setHours(23, 59, 59, 999);
                isValid = isValid && itemDate <= endDate;
              }
              
              return isValid;
            });
          }
          break;
      }
    }

    setFilteredHistory(filtered);
    setCurrentPage(1);
    setSelectedRecords(new Set());
    setSelectAll(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    if (value !== 'custom') {
      setCustomDateRange({ startDate: '', endDate: '' });
      setShowCalendar(false);
    } else {
      setShowCalendar(true);
    }
  };

  const handleCustomDateChange = (field, value) => {
    setCustomDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedRiskLevel('all');
    setSelectedPrediction('all');
    setDateRange('all');
    setCustomDateRange({ startDate: '', endDate: '' });
    setShowFilterDropdown(false);
    setShowCalendar(false);
  };

  const handleSelectRecord = (recordId) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
    setSelectAll(newSelected.size === filteredHistory.length && filteredHistory.length > 0);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecords(new Set());
      setSelectAll(false);
    } else {
      setSelectedRecords(new Set(filteredHistory.map(record => record._id)));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRecords.size === 0) return;
    
    const recordCount = selectedRecords.size;
    const confirmMessage = `Are you sure you want to delete ${recordCount} selected record${recordCount > 1 ? 's' : ''}?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setBulkDeleteLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5001/history/bulk-delete', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prediction_ids: Array.from(selectedRecords)
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          logout();
          return;
        }
        
        let errorMessage = 'Failed to delete records';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Update local state
      setHistory(prev => prev.filter(item => !selectedRecords.has(item._id)));
      setSelectedRecords(new Set());
      setSelectAll(false);
      
      // Show success message briefly
      console.log(result.message);
      
    } catch (err) {
      console.error('Bulk delete error:', err);
      setError(err.message || 'Error deleting records');
    } finally {
      setBulkDeleteLoading(false);
    }
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
      setSelectedRecords(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(id);
        return newSelected;
      });
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

  // Pagination calculations - This now works on the client-side filtered data
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredHistory.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredHistory.length / recordsPerPage);

  // Pagination handlers
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
    setSelectedRecords(new Set()); // Clear selections when changing pages
    setSelectAll(false);
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
    setSelectedRecords(new Set()); // Clear selections when changing pages
    setSelectAll(false);
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedRecords(new Set()); // Clear selections when changing pages
    setSelectAll(false);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(currentPage - half, 1);
      let end = Math.min(start + maxVisiblePages - 1, totalPages);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(end - maxVisiblePages + 1, 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

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
            
            <div className="header-actions">
              {selectedRecords.size > 0 && (
                <button 
                  className="bulk-delete-btn"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteLoading}
                  title={`Delete ${selectedRecords.size} selected records`}
                >
                  {bulkDeleteLoading ? (
                    <Loader size={18} />
                  ) : (
                    <Trash2 size={18} />
                  )}
                  Delete Selected ({selectedRecords.size})
                </button>
              )}
              
              <button 
                className="refresh-btn"
                onClick={fetchHistory}
                disabled={loading}
                title="Refresh history"
              >
                {loading ? <Loader size={18} /> : 'Refresh'}
              </button>
            </div>
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
                      onChange={(e) => handleDateRangeChange(e.target.value)}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="year">Last Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                  
                  {showCalendar && (
                    <div className="calendar-section">
                      <div className="calendar-header">
                        <Calendar size={16} />
                        <span>Select Date Range</span>
                        <button 
                          className="close-calendar"
                          onClick={() => setShowCalendar(false)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="date-inputs">
                        <div className="date-input-group">
                          <label>From:</label>
                          <input
                            type="date"
                            value={customDateRange.startDate}
                            onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                            max={customDateRange.endDate || undefined}
                          />
                        </div>
                        
                        <div className="date-input-group">
                          <label>To:</label>
                          <input
                            type="date"
                            value={customDateRange.endDate}
                            onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                            min={customDateRange.startDate || undefined}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
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
                  Date: {dateRange === 'custom' ? 
                    `${customDateRange.startDate || 'Start'} - ${customDateRange.endDate || 'End'}` : 
                    dateRange}
                  <button onClick={() => {
                    setDateRange('all');
                    setCustomDateRange({ startDate: '', endDate: '' });
                    setShowCalendar(false);
                  }}>×</button>
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
                      <th>
                        <button 
                          className="select-all-btn"
                          onClick={handleSelectAll}
                          title={selectAll ? 'Deselect all' : 'Select all visible records'}
                        >
                          {selectAll ? (
                            <CheckSquare size={18} />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </th>
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
                      <tr key={record._id} className={selectedRecords.has(record._id) ? 'selected' : ''}>
                        <td>
                          <button
                            className="select-record-btn"
                            onClick={() => handleSelectRecord(record._id)}
                            title="Select record"
                          >
                            {selectedRecords.has(record._id) ? (
                              <CheckSquare size={18} />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </td>
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
                          <div className="action-buttons">
                            <button 
                              className="details-btn"
                              onClick={() => setSelectedRecord(record)}
                              title="View details"
                            >
                              <span>View</span>
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDelete(record._id)}
                              disabled={deleteLoading === record._id}
                              title="Delete record"
                            >
                              {deleteLoading === record._id ? (
                                <Loader size={14} />
                              ) : (
                                <>
                                  <Trash2 size={14} />
                                  <span>Delete</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <div className="pagination-info">
                    Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredHistory.length)} of {filteredHistory.length} records
                    {filteredHistory.length !== history.length && (
                      <span className="filtered-info"> (filtered from {history.length} total)</span>
                    )}
                  </div>
                  
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      title="Previous page"
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </button>
                    
                    <div className="page-numbers">
                      {getPageNumbers().map(pageNumber => (
                        <button
                          key={pageNumber}
                          className={`page-number-btn ${currentPage === pageNumber ? 'active' : ''}`}
                          onClick={() => handlePageClick(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      className="pagination-btn"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      title="Next page"
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
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