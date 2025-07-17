import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../auth';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/sidebar';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  XCircle,
  BarChart,
  PieChart,
  ChevronDown,
  ChevronUp,
  Eye,
  Calendar,
  TrendingUp,
  Users,
  AlertTriangle
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { 
  PieChart as RechartsPieChart,
  Pie, 
  Cell, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import '../styles/datasetexplorer.css';

const DatasetExplorerPage = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    riskLevel: '',
    minAge: '',
    maxAge: '',
    minBilirubin: '',
    maxBilirubin: '',
    minAlbumin: '',
    maxAlbumin: '',
    minAlt: '',
    maxAlt: '',
    minAst: '',
    maxAst: '',
    minCopper: '',
    maxCopper: '',
    minAlkPhos: '',
    maxAlkPhos: '',
    minTryglicerides: '',
    maxTryglicerides: '',
    minProthrombin: '',
    maxProthrombin: '',
    stage: '',
    drug: '',
    ascites: '',
    hepatomegaly: '',
    spiders: '',
    edema: '',
    dateFrom: '',
    dateTo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [expandedCharts, setExpandedCharts] = useState(true);
  const [expandedStats, setExpandedStats] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Authentication check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      return;
    }
  }, [isAuthenticated, isAuthLoading]);

  // Fetch Data from Backend
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'Researcher') {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get('http://localhost:5001/api/explore', {
          params: {
            page: currentPage,
            per_page: itemsPerPage,
            sort_key: sortConfig.key,
            sort_direction: sortConfig.direction,
            risk_level: filters.riskLevel || undefined,
            min_age: filters.minAge || undefined,
            max_age: filters.maxAge || undefined,
            min_bilirubin: filters.minBilirubin || undefined,
            max_bilirubin: filters.maxBilirubin || undefined,
            min_albumin: filters.minAlbumin || undefined,
            max_albumin: filters.maxAlbumin || undefined,
            min_alt: filters.minAlt || undefined,
            max_alt: filters.maxAlt || undefined,
            min_ast: filters.minAst || undefined,
            max_ast: filters.maxAst || undefined,
            min_copper: filters.minCopper || undefined,
            max_copper: filters.maxCopper || undefined,
            min_alk_phos: filters.minAlkPhos || undefined,
            max_alk_phos: filters.maxAlkPhos || undefined,
            min_tryglicerides: filters.minTryglicerides || undefined,
            max_tryglicerides: filters.maxTryglicerides || undefined,
            min_prothrombin: filters.minProthrombin || undefined,
            max_prothrombin: filters.maxProthrombin || undefined,
            stage: filters.stage || undefined,
            drug: filters.drug || undefined,
            ascites: filters.ascites || undefined,
            hepatomegaly: filters.hepatomegaly || undefined,
            spiders: filters.spiders || undefined,
            edema: filters.edema || undefined,
            date_from: filters.dateFrom || undefined,
            date_to: filters.dateTo || undefined,
            search_term: searchTerm || undefined
          },
          withCredentials: true
        });
        
        if (response.data) {
          setData(response.data.records || []);
          setStats(response.data.stats || null);
          setTotalPages(response.data.pagination?.total_pages || 1);
        } else {
          setData([]);
          setStats(null);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Data fetch error:', err);
        if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else if (err.response?.status === 403) {
          setError('Access denied. Insufficient permissions.');
        } else {
          setError('Failed to fetch data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, searchTerm, currentPage, sortConfig, isAuthenticated, user]);

  // Handle Sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Reset Filters
  const resetFilters = () => {
    setFilters({
      riskLevel: '',
      minAge: '',
      maxAge: '',
      minBilirubin: '',
      maxBilirubin: '',
      minAlbumin: '',
      maxAlbumin: '',
      minAlt: '',
      maxAlt: '',
      minAst: '',
      maxAst: '',
      minCopper: '',
      maxCopper: '',
      minAlkPhos: '',
      maxAlkPhos: '',
      minTryglicerides: '',
      maxTryglicerides: '',
      minProthrombin: '',
      maxProthrombin: '',
      stage: '',
      drug: '',
      ascites: '',
      hepatomegaly: '',
      spiders: '',
      edema: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'record_id', 'n_days', 'drug', 'age', 'sex', 'ascites', 'hepatomegaly', 
      'spiders', 'edema', 'bilirubin', 'cholesterol', 'albumin', 'copper', 
      'alk_phos', 'sgot', 'tryglicerides', 'platelets', 'prothrombin', 'stage',
      'risk_level', 'timestamp'
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => 
        headers.map(key => {
          const val = item[key];
          if (val === null || val === undefined) return '';
          if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
          return val;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `liverlens_dataset_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Risk Level Breakdown for Pie Chart
  const riskBreakdown = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { name: 'High', value: 0, percentage: 0 },
        { name: 'Medium', value: 0, percentage: 0 },
        { name: 'Low', value: 0, percentage: 0 }
      ];
    }

    const counts = { High: 0, Medium: 0, Low: 0 };
    data.forEach(item => {
      if (item.risk_level && counts.hasOwnProperty(item.risk_level)) {
        counts[item.risk_level]++;
      }
    });
    
    const total = data.length;
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? parseFloat(((value / total) * 100).toFixed(1)) : 0
    }));
  }, [data]);

  // ALT Distribution for Bar Chart - FIXED TO USE SGOT
  const altDistribution = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const ranges = [
      { range: '0-50', min: 0, max: 50 },
      { range: '51-100', min: 51, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201+', min: 201, max: Infinity }
    ];
    
    return ranges.map(({ range, min, max }) => ({
      range,
      count: data.filter(item => {
        // FIXED: Use 'sgot' instead of 'alt' to match backend data
        const alt = parseFloat(item.sgot);
        return !isNaN(alt) && alt >= min && alt <= max;
      }).length
    }));
  }, [data]);

  // Time Series Data for Line Chart - FIXED TO USE SGOT
  const timeSeriesData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const monthlyData = {};
    data.forEach(item => {
      if (item.timestamp) {
        const month = new Date(item.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (!monthlyData[month]) {
          monthlyData[month] = { month, count: 0, avgAlt: 0, altSum: 0 };
        }
        monthlyData[month].count++;
        // FIXED: Use 'sgot' instead of 'alt' to match backend data
        if (item.sgot && !isNaN(parseFloat(item.sgot))) {
          monthlyData[month].altSum += parseFloat(item.sgot);
        }
      }
    });
    
    return Object.values(monthlyData).map(item => ({
      ...item,
      avgAlt: item.count > 0 ? (item.altSum / item.count).toFixed(1) : 0
    })).slice(-6); // Last 6 months
  }, [data]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  // Risk level colors
  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffd166';
      case 'low': return '#06d6a0';
      default: return '#6c757d';
    }
  };

  // Pie chart colors
  const PIE_COLORS = ['#ff6b6b', '#ffd166', '#06d6a0'];

  // Authentication and Role Check
  if (isAuthLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/LoginPage" replace />;
  }

  if (!user || user.role !== 'Researcher') {
    return (
      <div className="access-denied">
        <div className="denied-content">
          <AlertTriangle size={64} className="denied-icon" />
          <h1>Access Denied</h1>
          <p>This page is restricted to researchers only.</p>
          <button onClick={() => window.location.href = '/dashboard'} className="return-btn">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar 
        userRole={user.role} 
        onLogout={logout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />
      
      <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="explorer-container">
          <div className="explorer-header">
            <div className="header-content">
              <BarChart className="header-icon" />
              <div className="header-text">
                <h1>Dataset Explorer</h1>
                <p>Explore anonymized liver disease prediction data for research insights</p>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <section className="filters-section">
            <div className="section-header">
              <Filter className="section-icon" />
              <h3>Filters & Search</h3>
            </div>
            
            <div className="search-bar">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by Record ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filters-grid">
              <div className="filter-group">
                <label>Risk Level</label>
                <select 
                  value={filters.riskLevel}
                  onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
                  className="filter-select"
                >
                  <option value="">All Levels</option>
                  <option value="High">High Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="Low">Low Risk</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Age Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min Age"
                    value={filters.minAge}
                    onChange={(e) => setFilters({...filters, minAge: e.target.value})}
                    className="range-input"
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max Age"
                    value={filters.maxAge}
                    onChange={(e) => setFilters({...filters, maxAge: e.target.value})}
                    className="range-input"
                  />
                </div>
              </div>
              
              <div className="filter-group">
                <label>Bilirubin (mg/dl)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Min"
                    value={filters.minBilirubin}
                    onChange={(e) => setFilters({...filters, minBilirubin: e.target.value})}
                    className="range-input"
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Max"
                    value={filters.maxBilirubin}
                    onChange={(e) => setFilters({...filters, maxBilirubin: e.target.value})}
                    className="range-input"
                  />
                </div>
              </div>
              
              <div className="filter-group">
                <label>ALT (U/L)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minAlt}
                    onChange={(e) => setFilters({...filters, minAlt: e.target.value})}
                    className="range-input"
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAlt}
                    onChange={(e) => setFilters({...filters, maxAlt: e.target.value})}
                    className="range-input"
                  />
                </div>
              </div>
              
              <div className="filter-group">
                <label>AST (U/L)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minAst}
                    onChange={(e) => setFilters({...filters, minAst: e.target.value})}
                    className="range-input"
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAst}
                    onChange={(e) => setFilters({...filters, maxAst: e.target.value})}
                    className="range-input"
                  />
                </div>
              </div>
              <div className="filter-group">
                <label>Copper (μg/day)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minCopper}
                    onChange={(e) => setFilters({...filters, minCopper: e.target.value})}
                    className="range-input"
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxCopper}
                    onChange={(e) => setFilters({...filters, maxCopper: e.target.value})}
                    className="range-input"
                  />
                </div>
              </div>
              
              <div className="filter-group">
                <label>Alkaline Phosphatase</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minAlkPhos}
                    onChange={(e) => setFilters({...filters, minAlkPhos: e.target.value})}
                    className="range-input"
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAlkPhos}
                    onChange={(e) => setFilters({...filters, maxAlkPhos: e.target.value})}
                    className="range-input"
                  />
                </div>
              </div>
              
              <div className="filter-group">
                <label>Tryglicerides (mg/dl)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minTryglicerides}
                    onChange={(e) => setFilters({...filters, minTryglicerides: e.target.value})}
                    className="range-input"
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxTryglicerides}
                    onChange={(e) => setFilters({...filters, maxTryglicerides: e.target.value})}
                    className="range-input"
                  />
                </div>
              </div>
              
              <div className="filter-group">
                <label>Prothrombin Time</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Min"
                    value={filters.minProthrombin}
                    onChange={(e) => setFilters({...filters, minProthrombin: e.target.value})}
                    className="range-input"
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Max"
                    value={filters.maxProthrombin}
                    onChange={(e) => setFilters({...filters, maxProthrombin: e.target.value})}
                    className="range-input"
                  />
                </div>
              </div>
              
              <div className="filter-group">
                <label>Stage</label>
                <select 
                  value={filters.stage}
                  onChange={(e) => setFilters({...filters, stage: e.target.value})}
                  className="filter-select"
                >
                  <option value="">All Stages</option>
                  <option value="1">Stage 1</option>
                  <option value="2">Stage 2</option>
                  <option value="3">Stage 3</option>
                  <option value="4">Stage 4</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Drug</label>
                <select 
                  value={filters.drug}
                  onChange={(e) => setFilters({...filters, drug: e.target.value})}
                  className="filter-select"
                >
                  <option value="">All Drugs</option>
                  <option value="D-penicillamine">D-penicillamine</option>
                  <option value="Placebo">Placebo</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Ascites</label>
                <select 
                  value={filters.ascites}
                  onChange={(e) => setFilters({...filters, ascites: e.target.value})}
                  className="filter-select"
                >
                  <option value="">All</option>
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Hepatomegaly</label>
                <select 
                  value={filters.hepatomegaly}
                  onChange={(e) => setFilters({...filters, hepatomegaly: e.target.value})}
                  className="filter-select"
                >
                  <option value="">All</option>
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Spiders</label>
                <select 
                  value={filters.spiders}
                  onChange={(e) => setFilters({...filters, spiders: e.target.value})}
                  className="filter-select"
                >
                  <option value="">All</option>
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </div>
              
              
              <div className="filter-group">
                <label>Date Range</label>
                <div className="range-inputs">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    className="range-input"
                  />
                  <span className="range-separator">to</span>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    className="range-input"
                  />
                </div>
              </div>
            </div>
            
            <div className="filter-actions">
              <button className="reset-btn" onClick={resetFilters}>
                <XCircle size={16} /> Reset Filters
              </button>
              <button className="export-btn" onClick={exportToCSV} disabled={!data || data.length === 0}>
                <Download size={16} /> Export CSV
              </button>
            </div>
          </section>

          {/* Summary Statistics */}
          <section className="stats-section">
            <div className="section-header" onClick={() => setExpandedStats(!expandedStats)}>
              <TrendingUp className="section-icon" />
              <h3>Summary Statistics</h3>
              {expandedStats ? <ChevronUp /> : <ChevronDown />}
            </div>
            
            {expandedStats && (
              <div className="stats-content">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <Users className="icon" />
                    </div>
                    <div className="stat-info">
                      <h4>Total Records</h4>
                      <p className="stat-value">{stats?.total_records || 0}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <Calendar className="icon" />
                    </div>
                    <div className="stat-info">
                      <h4>Average Age</h4>
                      <p className="stat-value">{stats?.avg_age ? stats.avg_age.toFixed(1) : 'N/A'} years</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <Activity className="icon" />
                    </div>
                    <div className="stat-info">
                      <h4>Average Bilirubin</h4>
                      <p className="stat-value">{stats?.avg_bilirubin ? stats.avg_bilirubin.toFixed(2) : 'N/A'} mg/dl</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <BarChart className="icon" />
                    </div>
                    <div className="stat-info">
                      <h4>Average ALT</h4>
                      <p className="stat-value">{stats?.avg_alt ? stats.avg_alt.toFixed(1) : 'N/A'} U/L</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <BarChart className="icon" />
                    </div>
                    <div className="stat-info">
                      <h4>Average Copper</h4>
                      <p className="stat-value">{stats?.avg_copper ? stats.avg_copper.toFixed(1) : 'N/A'} μg/day</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <Activity className="icon" />
                    </div>
                    <div className="stat-info">
                      <h4>Average Tryglicerides</h4>
                      <p className="stat-value">{stats?.avg_tryglicerides ? stats.avg_tryglicerides.toFixed(1) : 'N/A'} mg/dl</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Charts Section */}
          <section className="charts-section">
            <div className="section-header" onClick={() => setExpandedCharts(!expandedCharts)}>
              <PieChart className="section-icon" />
              <h3>Data Visualizations</h3>
              {expandedCharts ? <ChevronUp /> : <ChevronDown />}
            </div>
            
            {expandedCharts && (
              <div className="charts-content">
                <div className="charts-grid">
                  <div className="chart-card">
                    <h4>Risk Level Distribution</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie 
                          data={riskBreakdown} 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={80} 
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percentage}) => `${name}: ${percentage}%`}
                        >
                          {riskBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="chart-card">
                    <h4>ALT Distribution</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={altDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#4f46e5" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="chart-card chart-card-full">
                    <h4>Monthly Trends</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="count" fill="#06d6a0" name="Record Count" />
                        <Line yAxisId="right" type="monotone" dataKey="avgAlt" stroke="#ff6b6b" strokeWidth={2} name="Avg ALT" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Data Table Section */}
          <section className="data-table-section">
            <div className="section-header">
              <Activity className="section-icon" />
              <h3>Prediction Records</h3>
            </div>
            
            {loading ? (
              <div className="table-loading">
                <div className="loading-spinner"></div>
                <p>Loading dataset...</p>
              </div>
            ) : error ? (
              <div className="table-error">
                <AlertTriangle className="error-icon" />
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
              </div>
            ) : (
              <>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('record_id')} className="sortable">
                          Record ID {sortConfig.key === 'record_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('n_days')} className="sortable">
                          N Days {sortConfig.key === 'n_days' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('drug')} className="sortable">
                          Drug {sortConfig.key === 'drug' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('age')} className="sortable">
                          Age {sortConfig.key === 'age' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('sex')} className="sortable">
                          Sex {sortConfig.key === 'sex' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('ascites')} className="sortable">
                          Ascites {sortConfig.key === 'ascites' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('hepatomegaly')} className="sortable">
                          Hepatomegaly {sortConfig.key === 'hepatomegaly' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('spiders')} className="sortable">
                          Spiders {sortConfig.key === 'spiders' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('edema')} className="sortable">
                          Edema {sortConfig.key === 'edema' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('bilirubin')} className="sortable">
                          Bilirubin {sortConfig.key === 'bilirubin' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('cholesterol')} className="sortable">
                          Cholesterol {sortConfig.key === 'cholesterol' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('albumin')} className="sortable">
                          Albumin {sortConfig.key === 'albumin' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('copper')} className="sortable">
                          Copper {sortConfig.key === 'copper' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('alk_phos')} className="sortable">
                          Alk Phos {sortConfig.key === 'alk_phos' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('sgot')} className="sortable">
                          SGOT {sortConfig.key === 'sgot' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('tryglicerides')} className="sortable">
                          Tryglicerides {sortConfig.key === 'tryglicerides' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('platelets')} className="sortable">
                          Platelets {sortConfig.key === 'platelets' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('prothrombin')} className="sortable">
                          Prothrombin {sortConfig.key === 'prothrombin' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('stage')} className="sortable">
                          Stage {sortConfig.key === 'stage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('risk_level')} className="sortable">
                          Risk Level {sortConfig.key === 'risk_level' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('timestamp')} className="sortable">
                          Date {sortConfig.key === 'timestamp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data && data.length > 0 ? (
                        data.map((record) => (
                          <tr key={record.record_id} onClick={() => setSelectedRecord(record)} className="table-row">
                            <td className="record-id">{record.record_id}</td>
                            <td>{record.n_days || 'N/A'}</td>
                            <td>{record.drug || 'N/A'}</td>
                            <td>{record.age || 'N/A'}</td>
                            <td>{record.sex || 'N/A'}</td>
                            <td>{record.ascites || 'N/A'}</td>
                            <td>{record.hepatomegaly || 'N/A'}</td>
                            <td>{record.spiders || 'N/A'}</td>
                            <td>{record.edema || 'N/A'}</td>
                            <td>{record.bilirubin ? parseFloat(record.bilirubin).toFixed(2) : 'N/A'}</td>
                            <td>{record.cholesterol ? parseFloat(record.cholesterol).toFixed(1) : 'N/A'}</td>
                            <td>{record.albumin ? parseFloat(record.albumin).toFixed(2) : 'N/A'}</td>
                            <td>{record.copper ? parseFloat(record.copper).toFixed(1) : 'N/A'}</td>
                            <td>{record.alk_phos ? parseFloat(record.alk_phos).toFixed(1) : 'N/A'}</td>
                            <td>{record.sgot ? parseFloat(record.sgot).toFixed(1) : 'N/A'}</td>
                            <td>{record.tryglicerides ? parseFloat(record.tryglicerides).toFixed(1) : 'N/A'}</td>
                            <td>{record.platelets || 'N/A'}</td>
                            <td>{record.prothrombin ? parseFloat(record.prothrombin).toFixed(1) : 'N/A'}</td>
                            <td>{record.stage || 'N/A'}</td>
                            <td>
                              <span 
                                className={`risk-badge risk-${record.risk_level ? record.risk_level.toLowerCase() : 'unknown'}`}
                                style={{ backgroundColor: getRiskColor(record.risk_level) }}
                              >
                                {record.risk_level || 'Unknown'}
                              </span>
                            </td>
                            <td>{record.timestamp ? new Date(record.timestamp).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="21" className="no-data">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </section>

          {/* Record Detail Modal */}
          {selectedRecord && (
            <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <div className="modal-title">
                    <Eye className="modal-icon" />
                    <h3>Record Details</h3>
                  </div>
                  <button className="close-btn" onClick={() => setSelectedRecord(null)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Record ID:</strong> 
                      <span>{selectedRecord.record_id}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Sex:</strong> 
                      <span>{selectedRecord.sex || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Ascites:</strong> 
                      <span>{selectedRecord.ascites || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Hepatomegaly:</strong> 
                      <span>{selectedRecord.hepatomegaly || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Spiders:</strong> 
                      <span>{selectedRecord.spiders || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Edema:</strong> 
                      <span>{selectedRecord.edema || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Bilirubin:</strong> 
                      <span>{selectedRecord.bilirubin ? `${parseFloat(selectedRecord.bilirubin).toFixed(2)} mg/dl` : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Cholesterol:</strong> 
                      <span>{selectedRecord.cholesterol ? `${parseFloat(selectedRecord.cholesterol).toFixed(1)} mg/dl` : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Albumin:</strong> 
                      <span>{selectedRecord.albumin ? `${parseFloat(selectedRecord.albumin).toFixed(2)} gm/dl` : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Copper:</strong> 
                      <span>{selectedRecord.copper ? `${parseFloat(selectedRecord.copper).toFixed(1)} μg/day` : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Alkaline Phosphatase:</strong> 
                      <span>{selectedRecord.alk_phos ? `${parseFloat(selectedRecord.alk_phos).toFixed(1)} U/L` : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>SGOT:</strong> 
                      <span>{selectedRecord.sgot ? `${parseFloat(selectedRecord.sgot).toFixed(1)} U/L` : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Tryglicerides:</strong> 
                      <span>{selectedRecord.tryglicerides ? `${parseFloat(selectedRecord.tryglicerides).toFixed(1)} mg/dl` : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Platelets:</strong> 
                      <span>{selectedRecord.platelets || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Prothrombin Time:</strong> 
                      <span>{selectedRecord.prothrombin ? `${parseFloat(selectedRecord.prothrombin).toFixed(1)} sec` : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Stage:</strong> 
                      <span>{selectedRecord.stage || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Risk Level:</strong> 
                      <span 
                        className={`risk-badge risk-${selectedRecord.risk_level ? selectedRecord.risk_level.toLowerCase() : 'unknown'}`}
                        style={{ backgroundColor: getRiskColor(selectedRecord.risk_level) }}
                      >
                        {selectedRecord.risk_level || 'Unknown'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Prediction Date:</strong> 
                      <span>{selectedRecord.timestamp ? new Date(selectedRecord.timestamp).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DatasetExplorerPage;