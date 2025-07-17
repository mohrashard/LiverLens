import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import Sidebar from '../components/sidebar';
import html2canvas from 'html2canvas';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Download,
  Loader,
  AlertCircle,
  PieChart,
  LineChart,
  Grid,
  FileText,
  Filter,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown
} from 'lucide-react';
import '../styles/analysis.css';

const AnalysisPage = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Data states
  const [summaryStats, setSummaryStats] = useState(null);
  const [predictionOutcomes, setPredictionOutcomes] = useState(null);
  const [featureDistribution, setFeatureDistribution] = useState(null);
  const [correlationData, setCorrelationData] = useState(null);
  const [featureImportance, setFeatureImportance] = useState(null);
  const [temporalTrends, setTemporalTrends] = useState(null);
  const [subgroupComparison, setSubgroupComparison] = useState(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [exportingChart, setExportingChart] = useState(null);

  // API Functions with better error handling
  const fetchSummaryStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/analysis/summary', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSummaryStats(data);
    } catch (err) {
      console.error('Error fetching summary stats:', err);
      throw err;
    }
  };

  const fetchPredictionOutcomes = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/analysis/outcomes', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPredictionOutcomes(data);
    } catch (err) {
      console.error('Error fetching prediction outcomes:', err);
      throw err;
    }
  };

  const fetchFeatureDistribution = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/analysis/feature-distribution', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFeatureDistribution(data);
    } catch (err) {
      console.error('Error fetching feature distribution:', err);
      throw err;
    }
  };

  const fetchCorrelationData = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/analysis/correlation', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCorrelationData(data);
    } catch (err) {
      console.error('Error fetching correlation data:', err);
      throw err;
    }
  };

  const fetchFeatureImportance = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/analysis/feature-importance', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFeatureImportance(data);
    } catch (err) {
      console.error('Error fetching feature importance:', err);
      throw err;
    }
  };

  const fetchTemporalTrends = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/analysis/temporal-trends', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTemporalTrends(data);
    } catch (err) {
      console.error('Error fetching temporal trends:', err);
      throw err;
    }
  };

  const fetchSubgroupComparison = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/analysis/subgroup-comparison', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSubgroupComparison(data);
    } catch (err) {
      console.error('Error fetching subgroup comparison:', err);
      throw err;
    }
  };

  // Load all data with better error handling
  const loadAllData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const promises = [
        fetchSummaryStats(),
        fetchPredictionOutcomes(),
        fetchFeatureDistribution(),
        fetchCorrelationData(),
        fetchFeatureImportance(),
        fetchTemporalTrends(),
        fetchSubgroupComparison()
      ];
      
      const results = await Promise.allSettled(promises);
      
      // Check for any failures
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.warn('Some data failed to load:', failures);
        setError(`Failed to load ${failures.length} data sources. Some charts may not display correctly.`);
      }
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load analysis data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  // Fixed export function with html2canvas
  const exportChartAsPNG = async (chartId) => {
    setExportingChart(chartId);
    try {
      const element = document.getElementById(chartId);
      if (!element) {
        throw new Error(`Chart element with ID ${chartId} not found`);
      }
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const link = document.createElement('a');
      link.download = `${chartId}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting chart:', error);
      alert('Failed to export chart. Please try again.');
    } finally {
      setExportingChart(null);
    }
  };

  const exportStatsAsCSV = () => {
    if (!summaryStats) return;
    
    const csvContent = "Statistic,Value\n" + 
      Object.entries(summaryStats)
        .map(([key, value]) => `${key},${value}`)
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'analysis_summary.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Improved correlation heatmap with better styling
  const renderCorrelationHeatmap = () => {
    if (!correlationData || !correlationData.correlation_matrix || !correlationData.features) {
      return <div className="analysis-loading-placeholder">No correlation data available</div>;
    }
    
    const matrix = correlationData.correlation_matrix;
    const features = correlationData.features;
    
    if (!matrix.length || !features.length) {
      return <div className="analysis-loading-placeholder">No correlation data available</div>;
    }
    
    return (
      <div className="analysis-correlation-heatmap">
        <div className="analysis-heatmap-container">
          <div className="analysis-heatmap-labels-top">
            {features.map((feature, index) => (
              <div key={`top-${feature}-${index}`} className="analysis-label-top">
                {feature}
              </div>
            ))}
          </div>
          
          <div className="analysis-heatmap-content">
            <div className="analysis-heatmap-labels-left">
              {features.map((feature, index) => (
                <div key={`left-${feature}-${index}`} className="analysis-label-left">
                  {feature}
                </div>
              ))}
            </div>
            
            <div className="analysis-heatmap-grid">
              {features.map((rowFeature, rowIndex) => (
                <div key={`row-${rowFeature}-${rowIndex}`} className="analysis-heatmap-row">
                  {features.map((colFeature, colIndex) => {
                    const value = matrix[rowIndex] && matrix[rowIndex][colIndex] !== undefined 
                      ? matrix[rowIndex][colIndex] 
                      : 0;
                    const intensity = Math.abs(value);
                    const colorClass = value > 0.1 ? 'positive' : value < -0.1 ? 'negative' : 'neutral';
                    
                    return (
                      <div
                        key={`cell-${rowFeature}-${colFeature}-${rowIndex}-${colIndex}`}
                        className={`analysis-heatmap-cell ${colorClass}`}
                        style={{ 
                          opacity: Math.max(0.3, intensity),
                          backgroundColor: value > 0.1 ? `rgba(34, 197, 94, ${intensity})` : 
                                         value < -0.1 ? `rgba(239, 68, 68, ${intensity})` : 
                                         `rgba(156, 163, 175, 0.3)`
                        }}
                        title={`${rowFeature} vs ${colFeature}: ${value.toFixed(3)}`}
                      >
                        <span className="analysis-cell-value">{value.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="analysis-correlation-legend">
          <div className="analysis-legend-item">
            <div className="analysis-legend-color positive"></div>
            <span>Positive Correlation</span>
          </div>
          <div className="analysis-legend-item">
            <div className="analysis-legend-color neutral"></div>
            <span>Neutral</span>
          </div>
          <div className="analysis-legend-item">
            <div className="analysis-legend-color negative"></div>
            <span>Negative Correlation</span>
          </div>
        </div>
      </div>
    );
  };

  // Render feature importance chart
  const renderFeatureImportance = () => {
    if (!featureImportance || !Array.isArray(featureImportance) || featureImportance.length === 0) {
      return <div className="analysis-loading-placeholder">No feature importance data available</div>;
    }
    
    const maxImportance = Math.max(...featureImportance.map(f => f.importance));
    
    return (
      <div className="analysis-feature-importance-chart">
        {featureImportance.map((feature, index) => (
          <div key={`${feature.feature}-${index}`} className="analysis-importance-bar">
            <div className="analysis-feature-name" title={feature.feature}>{feature.feature}</div>
            <div className="analysis-bar-container">
              <div 
                className="analysis-bar-fill"
                style={{ 
                  width: `${maxImportance > 0 ? (feature.importance / maxImportance) * 100 : 0}%`,
                  background: `linear-gradient(90deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8))`
                }}
              />
            </div>
            <div className="analysis-importance-value">{feature.importance.toFixed(3)}</div>
          </div>
        ))}
      </div>
    );
  };

  // Render temporal trends
  const renderTemporalTrends = () => {
    if (!temporalTrends || !Array.isArray(temporalTrends) || temporalTrends.length === 0) {
      return <div className="analysis-loading-placeholder">No temporal trends data available</div>;
    }
    
    const maxCount = Math.max(...temporalTrends.map(t => t.count));
    
    return (
      <div className="analysis-temporal-trends-chart">
        <div className="analysis-trend-line">
          {temporalTrends.map((point, index) => (
            <div 
              key={`${point.date}-${index}`}
              className="analysis-trend-point"
              style={{ 
                height: `${maxCount > 0 ? (point.count / maxCount) * 100 : 0}%`,
                background: `linear-gradient(180deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8))`
              }}
              title={`${point.date}: ${point.count} predictions`}
            />
          ))}
        </div>
        <div className="analysis-trend-labels">
          {temporalTrends.map((point, index) => (
            index % Math.ceil(temporalTrends.length / 8) === 0 && (
              <div key={`${point.date}-label-${index}`} className="analysis-trend-label">
                {new Date(point.date).toLocaleDateString()}
              </div>
            )
          ))}
        </div>
      </div>
    );
  };

  // Authentication checks
  if (isAuthLoading) {
    return (
      <div className="analysis-page">
        <div className="analysis-loading-container">
          <div className="analysis-loading-glass">
            <Loader className="analysis-loading-spinner" />
            <p>Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'Researcher') {
    return (
      <div className="analysis-page">
        <div className="analysis-access-denied">
          <div className="analysis-access-denied-glass">
            <AlertCircle className="analysis-access-denied-icon" />
            <h2>Access Denied</h2>
            <p>This page is restricted to researchers only.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="analysis-page">
        <div className="analysis-app-container">
          <Sidebar 
            userRole={user?.role} 
            onLogout={logout}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={setIsSidebarCollapsed}
          />
          <main className="analysis-main-content">
            <div className="analysis-loading-container">
              <div className="analysis-loading-glass">
                <Sparkles className="analysis-loading-spinner" />
                <p>Loading analysis data...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      <div className="analysis-app-container">
        <Sidebar 
          userRole={user?.role} 
          onLogout={logout}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={setIsSidebarCollapsed}
        />
        
        <main className="analysis-main-content">
          <div className="analysis-container">
            {/* Header */}
            <div className="analysis-header">
              <div className="analysis-header-content">
                <div className="analysis-header-icon-wrapper">
                  <BarChart3 className="analysis-header-icon" />
                  <div className="analysis-icon-glow"></div>
                </div>
                <div className="analysis-header-text">
                  <h1>Data Analysis Dashboard</h1>
                  <p>Welcome back, Researcher {user?.full_name}!</p>
                </div>
              </div>
              <div className="analysis-header-actions">
                <button 
                  className="analysis-btn-glass"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`analysis-btn-icon ${refreshing ? 'analysis-spinning' : ''}`} />
                  Refresh Data
                </button>
                <button 
                  className="analysis-btn-glass"
                  onClick={exportStatsAsCSV}
                  disabled={!summaryStats}
                >
                  <Download className="analysis-btn-icon" />
                  Export CSV
                </button>
              </div>
            </div>

            {error && (
              <div className="analysis-alert analysis-alert-error">
                <div className="analysis-alert-glass">
                  <AlertCircle className="analysis-alert-icon" />
                  <div>
                    <strong>Error:</strong> {error}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="analysis-tabs">
              <button 
                className={`analysis-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <Activity className="analysis-tab-icon" />
                <span>Overview</span>
              </button>
              <button 
                className={`analysis-tab ${activeTab === 'distributions' ? 'active' : ''}`}
                onClick={() => setActiveTab('distributions')}
              >
                <BarChart3 className="analysis-tab-icon" />
                <span>Distributions</span>
              </button>
              <button 
                className={`analysis-tab ${activeTab === 'correlations' ? 'active' : ''}`}
                onClick={() => setActiveTab('correlations')}
              >
                <Grid className="analysis-tab-icon" />
                <span>Correlations</span>
              </button>
              <button 
                className={`analysis-tab ${activeTab === 'trends' ? 'active' : ''}`}
                onClick={() => setActiveTab('trends')}
              >
                <TrendingUp className="analysis-tab-icon" />
                <span>Trends</span>
              </button>
            </div>

            {/* Content based on active tab */}
            <div className="analysis-content">
              {activeTab === 'overview' && (
                <div className="analysis-overview-grid">
                  {/* Summary Stats */}
                  <div className="analysis-card">
                    <div className="analysis-card-header">
                      <div className="analysis-card-icon-wrapper">
                        <FileText className="analysis-card-icon" />
                      </div>
                      <h3>Summary Statistics</h3>
                      <button 
                        className="analysis-export-btn"
                        onClick={() => exportChartAsPNG('summary-stats')}
                        disabled={exportingChart === 'summary-stats'}
                      >
                        {exportingChart === 'summary-stats' ? <Loader className="analysis-spinning" /> : <Download />}
                      </button>
                    </div>
                    <div id="summary-stats" className="analysis-card-content">
                      {summaryStats ? (
                        <div className="analysis-stats-grid">
                          <div className="analysis-stat-item">
                            <div className="analysis-stat-icon">
                              <Target />
                            </div>
                            <div className="analysis-stat-value">{summaryStats.total_predictions || 0}</div>
                            <div className="analysis-stat-label">Total Predictions</div>
                          </div>
                          <div className="analysis-stat-item">
                            <div className="analysis-stat-icon">
                              <Users />
                            </div>
                            <div className="analysis-stat-value">{summaryStats.avg_age?.toFixed(1) || 'N/A'}</div>
                            <div className="analysis-stat-label">Avg Age</div>
                          </div>
                          <div className="analysis-stat-item">
                            <div className="analysis-stat-icon">
                              <Activity />
                            </div>
                            <div className="analysis-stat-value">{summaryStats.avg_bilirubin?.toFixed(2) || 'N/A'}</div>
                            <div className="analysis-stat-label">Avg Bilirubin</div>
                          </div>
                          <div className="analysis-stat-item">
                            <div className="analysis-stat-icon">
                              <TrendingUp />
                            </div>
                            <div className="analysis-stat-value">{summaryStats.avg_albumin?.toFixed(2) || 'N/A'}</div>
                            <div className="analysis-stat-label">Avg Albumin</div>
                          </div>
                          <div className="analysis-stat-item high-risk">
                            <div className="analysis-stat-icon">
                              <AlertCircle />
                            </div>
                            <div className="analysis-stat-value">{summaryStats.high_risk_count || 0}</div>
                            <div className="analysis-stat-label">High Risk</div>
                          </div>
                          <div className="analysis-stat-item medium-risk">
                            <div className="analysis-stat-icon">
                              <TrendingDown />
                            </div>
                            <div className="analysis-stat-value">{summaryStats.medium_risk_count || 0}</div>
                            <div className="analysis-stat-label">Medium Risk</div>
                          </div>
                          <div className="analysis-stat-item low-risk">
                            <div className="analysis-stat-icon">
                              <Sparkles />
                            </div>
                            <div className="analysis-stat-value">{summaryStats.low_risk_count || 0}</div>
                            <div className="analysis-stat-label">Low Risk</div>
                          </div>
                        </div>
                      ) : (
                        <div className="analysis-loading-placeholder">Loading stats...</div>
                      )}
                    </div>
                  </div>

                  {/* Prediction Outcomes */}
                  <div className="analysis-card">
                    <div className="analysis-card-header">
                      <div className="analysis-card-icon-wrapper">
                        <PieChart className="analysis-card-icon" />
                      </div>
                      <h3>Prediction Outcomes</h3>
                      <button 
                        className="analysis-export-btn"
                        onClick={() => exportChartAsPNG('prediction-outcomes')}
                        disabled={exportingChart === 'prediction-outcomes'}
                      >
                        {exportingChart === 'prediction-outcomes' ? <Loader className="analysis-spinning" /> : <Download />}
                      </button>
                    </div>
                    <div id="prediction-outcomes" className="analysis-card-content">
                      {predictionOutcomes && Array.isArray(predictionOutcomes) && predictionOutcomes.length > 0 ? (
                        <div className="analysis-outcomes-chart">
                          {predictionOutcomes.map((outcome, index) => (
                            <div key={`${outcome.status}-${index}`} className="analysis-outcome-item">
                              <div className="analysis-outcome-bar">
                                <div 
                                  className={`analysis-outcome-fill ${outcome.status.toLowerCase()}`}
                                  style={{ 
                                    width: `${outcome.percentage || 0}%`,
                                    background: outcome.status === 'C' ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8))' : 
                                               outcome.status === 'CL' ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.8), rgba(251, 191, 36, 0.8))' : 
                                               outcome.status === 'D' ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.8), rgba(248, 113, 113, 0.8))' : 
                                               'linear-gradient(90deg, rgba(107, 114, 128, 0.8), rgba(156, 163, 175, 0.8))'
                                  }}
                                />
                              </div>
                              <div className="analysis-outcome-label">
                                {outcome.status}: {outcome.count || 0} ({(outcome.percentage || 0).toFixed(1)}%)
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="analysis-loading-placeholder">No prediction outcomes data available</div>
                      )}
                    </div>
                  </div>

                  {/* Subgroup Comparison */}
                  <div className="analysis-card full-width">
                    <div className="analysis-card-header">
                      <div className="analysis-card-icon-wrapper">
                        <Users className="analysis-card-icon" />
                      </div>
                      <h3>Subgroup Comparison</h3>
                      <button 
                        className="analysis-export-btn"
                        onClick={() => exportChartAsPNG('subgroup-comparison')}
                        disabled={exportingChart === 'subgroup-comparison'}
                      >
                        {exportingChart === 'subgroup-comparison' ? <Loader className="analysis-spinning" /> : <Download />}
                      </button>
                    </div>
                    <div id="subgroup-comparison" className="analysis-card-content">
                      {subgroupComparison && Object.keys(subgroupComparison).length > 0 ? (
                        <div className="analysis-comparison-grid">
                          {Object.entries(subgroupComparison).map(([comparisonType, data]) => (
                            <div key={comparisonType} className="analysis-comparison-section">
                              <h4>{comparisonType.replace('_', ' ').toUpperCase()}</h4>
                              <div className="analysis-comparison-bars">
                                {data && typeof data === 'object' && Object.entries(data).map(([group, values]) => (
                                  <div key={group} className="analysis-comparison-group">
                                    <div className="analysis-group-name">{group}</div>
                                    <div className="analysis-group-values">
                                      <div className="analysis-value-item">
                                        <span>Count: {values.count || 0}</span>
                                      </div>
                                      <div className="analysis-value-item">
                                        <span>Avg Age: {values.avg_age?.toFixed(1) || 'N/A'}</span>
                                      </div>
                                      <div className="analysis-value-item">
                                        <span>Avg Bilirubin: {values.avg_bilirubin?.toFixed(2) || 'N/A'}</span>
                                      </div>
                                      <div className="analysis-value-item">
                                        <span>Avg Albumin: {values.avg_albumin?.toFixed(2) || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="analysis-loading-placeholder">No subgroup comparison data available</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'distributions' && (
                <div className="analysis-distributions-grid">
                  <div className="analysis-card full-width">
                    <div className="analysis-card-header">
                      <div className="analysis-card-icon-wrapper">
                        <BarChart3 className="analysis-card-icon" />
                      </div>
                      <h3>Feature Distribution</h3>
                      <button 
                        className="analysis-export-btn"
                        onClick={() => exportChartAsPNG('feature-distribution')}
                        disabled={exportingChart === 'feature-distribution'}
                      >
                        {exportingChart === 'feature-distribution' ? <Loader className="analysis-spinning" /> : <Download />}
                      </button>
                    </div>
                    <div id="feature-distribution" className="analysis-card-content">
                      {featureDistribution && Object.keys(featureDistribution).length > 0 ? (
                        <div className="analysis-distribution-charts">
                          {Object.entries(featureDistribution).map(([feature, data]) => (
                            <div key={feature} className="analysis-distribution-chart">
                              <h4>{feature}</h4>
                              <div className="analysis-histogram">
                                {data.histogram && Array.isArray(data.histogram) && data.histogram.map((bin, index) => (
                                  <div 
                                    key={`${feature}-${index}`}
                                    className="analysis-histogram-bar"
                                    style={{ 
                                      height: `${data.max_count > 0 ? (bin.count / data.max_count) * 100 : 0}%`,
                                      background: `linear-gradient(180deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8))`
                                    }}
                                    title={`${bin.range}: ${bin.count} patients`}
                                  />
                                ))}
                              </div>
                              <div className="analysis-distribution-stats">
                                <span>Mean: {data.mean?.toFixed(2) || 'N/A'}</span>
                                <span>Std: {data.std?.toFixed(2) || 'N/A'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="analysis-loading-placeholder">No feature distribution data available</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'correlations' && (
                <div className="analysis-correlations-grid">
                  <div className="analysis-card full-width">
                    <div className="analysis-card-header">
                      <div className="analysis-card-icon-wrapper">
                        <Grid className="analysis-card-icon" />
                      </div>
                      <h3>Feature Correlations</h3>
                      <button 
                        className="analysis-export-btn"
                        onClick={() => exportChartAsPNG('correlation-heatmap')}
                        disabled={exportingChart === 'correlation-heatmap'}
                      >
                        {exportingChart === 'correlation-heatmap' ? <Loader className="analysis-spinning" /> : <Download />}
                      </button>
                    </div>
                    <div id="correlation-heatmap" className="analysis-card-content">
                      {renderCorrelationHeatmap()}
                    </div>
                  </div>

                  <div className="analysis-card full-width">
                    <div className="analysis-card-header">
                      <div className="analysis-card-icon-wrapper">
                        <BarChart3 className="analysis-card-icon" />
                      </div>
                      <h3>Feature Importance</h3>
                      <button 
                        className="analysis-export-btn"
                        onClick={() => exportChartAsPNG('feature-importance')}
                        disabled={exportingChart === 'feature-importance'}
                      >
                        {exportingChart === 'feature-importance' ? <Loader className="analysis-spinning" /> : <Download />}
                      </button>
                    </div>
                    <div id="feature-importance" className="analysis-card-content">
                      {renderFeatureImportance()}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'trends' && (
                <div className="analysis-trends-grid">
                  <div className="analysis-card full-width">
                    <div className="analysis-card-header">
                      <div className="analysis-card-icon-wrapper">
                        <LineChart className="analysis-card-icon" />
                      </div>
                      <h3>Temporal Trends</h3>
                      <button 
                        className="analysis-export-btn"
                        onClick={() => exportChartAsPNG('temporal-trends')}
                        disabled={exportingChart === 'temporal-trends'}
                      >
                        {exportingChart === 'temporal-trends' ? <Loader className="analysis-spinning" /> : <Download />}
                      </button>
                    </div>
                    <div id="temporal-trends" className="analysis-card-content">
                      {renderTemporalTrends()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalysisPage;