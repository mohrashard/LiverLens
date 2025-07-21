import React, { useState, useEffect } from "react";
import { useAuth } from "../auth";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { format, formatDistanceToNow } from "date-fns";
import {
  User,
  Activity,
  BarChart2,
  ArrowRight,
  Clock,
  PieChart,
  Loader,
  AlertCircle,
  TrendingUp,
  Shield,
  Heart,
  Brain,
  Star,
  CheckCircle,
  Info,
  Calendar,
  Target,
  Zap,
  Award,
  TrendingDown
} from "lucide-react";
import Sidebar from "../components/sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "../styles/dashboard.css";

// WelcomeBanner Component
const WelcomeBanner = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getRoleGreeting = () => {
    switch (user?.role) {
      case "Doctor":
        return `Dr. ${user.full_name.split(" ")[0]}`;
      case "Researcher":
        return `${user.full_name.split(" ")[0]}`;
      case "Student":
        return `Student ${user.full_name.split(" ")[0]}`;
      default:
        return user?.full_name.split(" ")[0] || "User";
    }
  };

  return (
    <div className="welcome-banner">
      <div className="welcome-content">
        <div className="avatar-container">
          <div className="avatar">
            <User size={32} />
          </div>
          <div className="status-indicator"></div>
        </div>
        <div className="welcome-text">
          <h1>
            {getGreeting()},{" "}
            <span className="user-name">{getRoleGreeting()}!</span>
          </h1>
          <p>
            Monitor patient health with AI-powered liver disease predictions
          </p>
        </div>
      </div>
      <div className="welcome-stats">
        <div className="stat-item">
          <Clock size={16} />
          <span>
            Last login:{" "}
            {user?.last_login
              ? format(new Date(user.last_login), "MMM d, h:mm a")
              : "First time"}
          </span>
        </div>
        <div className="stat-item">
          <Calendar size={16} />
          <span>Today: {format(new Date(), "EEEE, MMM d, yyyy")}</span>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, description, color = '#6366f1', trend }) => {
  const showTrend = trend && trend.type && trend.value;

  return (
    <div className="stat-card">
      {showTrend && (
        <div className={`trend-indicator ${trend.type}`}>
          {trend.type === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trend.value}</span>
        </div>
      )}

      <div className="stat-card-header">
        <div className="stat-icon" style={{ backgroundColor: color }}>
          {icon && React.cloneElement(icon, { color: 'white', size: 24 })}
        </div>
      </div>

      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <div className="stat-value">{value}</div>
        {description && <p className="stat-description">{description}</p>}
      </div>
    </div>
  );
};

// Enhanced RiskBadge Component
const RiskBadge = ({ riskLevel }) => {
  const getRiskConfig = () => {
    switch (riskLevel) {
      case "High":
        return {
          text: "High Risk",
          color: "#EF4444",
          bg: "#FEE2E2",
          icon: <AlertCircle size={12} />,
        };
      case "Medium":
        return {
          text: "Medium Risk",
          color: "#F59E0B",
          bg: "#FEF3C7",
          icon: <Info size={12} />,
        };
      case "Low":
        return {
          text: "Low Risk",
          color: "#10B981",
          bg: "#D1FAE5",
          icon: <CheckCircle size={12} />,
        };
      default:
        return {
          text: "Unknown",
          color: "#6B7280",
          bg: "#F3F4F6",
          icon: <Info size={12} />,
        };
    }
  };

  const config = getRiskConfig();
  return (
    <span
      className="risk-badge"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.icon}
      {config.text}
    </span>
  );
};

// Recommendations Component
const RecommendationsPanel = ({ user, stats, latestPrediction }) => {
  const getRecommendations = () => {
    const recommendations = [];

    if (stats.total_predictions === 0) {
      recommendations.push({
        icon: <Target size={16} />,
        title: "Make your first prediction",
        description: "Start by analyzing a patient's liver health data",
        priority: "high",
        action: "Get Started",
      });
    }

    if (stats.total_predictions > 0 && stats.total_predictions < 5) {
      recommendations.push({
        icon: <TrendingUp size={16} />,
        title: "Build your prediction history",
        description: "More predictions help identify patterns and trends",
        priority: "medium",
        action: "Continue",
      });
    }

    if (latestPrediction && latestPrediction.risk_level === "High") {
      recommendations.push({
        icon: <Shield size={16} />,
        title: "High risk patient detected",
        description: "Consider immediate consultation and follow-up",
        priority: "high",
        action: "Review Case",
      });
    }

    if (user?.role === "Doctor") {
      recommendations.push({
        icon: <Heart size={16} />,
        title: "Patient monitoring",
        description: "Regular check-ups improve early detection rates",
        priority: "medium",
        action: "Schedule",
      });
    }

    if (user?.role === "Student" || user?.role === "Researcher") {
      recommendations.push({
        icon: <Brain size={16} />,
        title: "Explore data patterns",
        description: "Analyze prediction trends to gain insights",
        priority: "low",
        action: "Analyze",
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="recommendations-panel">
      <div className="panel-header">
        <h3>
          <Star size={20} />
          Recommendations
        </h3>
      </div>
      <div className="recommendations-list">
        {recommendations.map((rec, index) => (
          <div key={index} className={`recommendation-item ${rec.priority}`}>
            <div className="rec-icon">{rec.icon}</div>
            <div className="rec-content">
              <h4>{rec.title}</h4>
              <p>{rec.description}</p>
            </div>
            <button className="rec-action">{rec.action}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced RecentPredictionsTable Component
const RecentPredictionsTable = ({
  predictions,
  onViewAll,
  onSelectPatient,
}) => {
  if (!predictions || predictions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Activity size={48} />
        </div>
        <h3>No predictions yet</h3>
        <p>Start making predictions to see your data here</p>
        <button className="btn-primary">
          <Zap size={16} />
          Make First Prediction
        </button>
      </div>
    );
  }

  return (
    <div className="recent-predictions">
      <div className="section-header">
        <h2>
          <BarChart2 size={20} />
          Recent Predictions
        </h2>
        <button className="view-all-btn" onClick={onViewAll}>
          View All <ArrowRight size={16} />
        </button>
      </div>
      <div className="table-container">
        <table className="predictions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Risk Level</th>
              <th>Patient</th>
              <th>Age</th>
              <th>ALT (SGOT)</th>
              <th>Platelets</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((prediction) => (
              <tr key={prediction._id}>
                <td>
                  <div className="date-cell">
                    {format(new Date(prediction.timestamp), "MMM d, yyyy")}
                    <span className="time">
                      {format(new Date(prediction.timestamp), "h:mm a")}
                    </span>
                  </div>
                </td>
                <td>
                  <RiskBadge riskLevel={prediction.risk_level} />
                </td>
                <td>
                  <div className="patient-cell">
                    <div className="patient-avatar">
                      <User size={16} />
                    </div>
                    <span>
                      {prediction.input_data.Patient_Name || "Unnamed Patient"}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="numeric-value">
                    {prediction.input_data.Age || "-"}
                  </span>
                </td>
                <td>
                  <span className="numeric-value">
                    {prediction.input_data.SGOT || "-"}
                  </span>
                </td>
                <td>
                  <span className="numeric-value">
                    {prediction.input_data.Platelets
                      ? `${prediction.input_data.Platelets}K`
                      : "-"}
                  </span>
                </td>
                <td>
                  <button
                    className="action-btn"
                    onClick={() =>
                      onSelectPatient(prediction.input_data.Patient_ID)
                    }
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Enhanced PatientChartSection Component with Close Button
const PatientChartSection = ({ predictions, onClose }) => {
  if (!predictions || predictions.length === 0) {
    return (
      <div className="empty-chart-state">
        <BarChart2 size={48} />
        <p>No predictions available for this patient.</p>
      </div>
    );
  }

  const data = predictions
    .map((pred) => ({
      timestamp: new Date(pred.timestamp).getTime(),
      platelets: pred.input_data.Platelets,
      alkPhos: pred.input_data.Alk_Phos,
      cholesterol: pred.input_data.Cholesterol,
      copper: pred.input_data.Copper,
      riskLevel: ["Low", "Medium", "High"].indexOf(pred.risk_level),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const formatDate = (timestamp) => format(new Date(timestamp), "MMM d");

  return (
    <div className="patient-charts">
      <div className="charts-header">
        <h2>
          <TrendingUp size={20} />
          Patient Prediction History
        </h2>
        <button 
          className="close-chart-btn" 
          onClick={onClose}
          title="Close charts"
        >
          ✕
        </button>
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Platelets Over Time</h3>
            <div className="chart-indicator platelets"></div>
          </div>
          <LineChart width={500} height={250} data={data}>
            <XAxis dataKey="timestamp" tickFormatter={formatDate} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <Line
              type="monotone"
              dataKey="platelets"
              stroke="#3b82f6"
              strokeWidth={2}
            />
            <Tooltip
              labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
            />
          </LineChart>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Alk Phos Over Time</h3>
            <div className="chart-indicator alkphos"></div>
          </div>
          <LineChart width={500} height={250} data={data}>
            <XAxis dataKey="timestamp" tickFormatter={formatDate} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <Line
              type="monotone"
              dataKey="alkPhos"
              stroke="#10b981"
              strokeWidth={2}
            />
            <Tooltip
              labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
            />
          </LineChart>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Cholesterol Over Time</h3>
            <div className="chart-indicator cholesterol"></div>
          </div>
          <LineChart width={500} height={250} data={data}>
            <XAxis dataKey="timestamp" tickFormatter={formatDate} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <Line
              type="monotone"
              dataKey="cholesterol"
              stroke="#f59e0b"
              strokeWidth={2}
            />
            <Tooltip
              labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
            />
          </LineChart>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Copper Over Time</h3>
            <div className="chart-indicator copper"></div>
          </div>
          <LineChart width={500} height={250} data={data}>
            <XAxis dataKey="timestamp" tickFormatter={formatDate} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <Line
              type="monotone"
              dataKey="copper"
              stroke="#ef4444"
              strokeWidth={2}
            />
            <Tooltip
              labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
            />
          </LineChart>
        </div>

        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Risk Level Over Time</h3>
            <div className="chart-indicator risk"></div>
          </div>
          <LineChart width={500} height={250} data={data}>
            <XAxis dataKey="timestamp" tickFormatter={formatDate} />
            <YAxis
              domain={[0, 2]}
              tickFormatter={(value) => {
                const labels = ["Low", "Medium", "High"];
                return labels[value] !== undefined ? labels[value] : "";
              }}
              tick={{ fill: "#e5e7eb" }}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <Line
              type="step"
              dataKey="riskLevel"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 5, stroke: "#8b5cf6", strokeWidth: 2, fill: "#8b5cf6" }}
            />
            <Tooltip
              labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
              formatter={(value) => {
                const levels = ["Low", "Medium", "High"];
                return [levels[value] ?? "Unknown", "Risk Level"];
              }}
            />
          </LineChart>
        </div>
      </div>
    </div>
  );
};

// Enhanced PredictionPieChart Component
const PredictionPieChart = ({ riskDistribution }) => {
  if (!riskDistribution || Object.keys(riskDistribution).length === 0) {
    return (
      <div className="empty-chart">
        <PieChart size={48} />
        <h3>No prediction data</h3>
        <p>Make predictions to see distribution</p>
      </div>
    );
  }

  const total = Object.values(riskDistribution).reduce(
    (sum, count) => sum + count,
    0
  );
  const data = Object.entries(riskDistribution).map(([risk, count]) => ({
    name: risk,
    value: count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  return (
    <div className="risk-distribution">
      <div className="section-header">
        <h3>
          <PieChart size={20} />
          Risk Distribution
        </h3>
      </div>
      <div className="distribution-content">
        <div className="distribution-visual">
          {data.map((item) => (
            <div key={item.name} className="risk-bar">
              <div className="bar-label">
                <span className="risk-name">{item.name}</span>
                <span className="risk-count">{item.value}</span>
              </div>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: getRiskColor(item.name),
                  }}
                />
                <span className="percentage">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="distribution-summary">
          <div className="summary-item">
            <Award size={16} />
            <span>Total Predictions: {total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Functions
const getRiskColor = (riskLevel) => {
  switch (riskLevel) {
    case "High":
      return "#EF4444";
    case "Medium":
      return "#F59E0B";
    case "Low":
      return "#10B981";
    default:
      return "#6B7280";
  }
};

const formatRiskText = (riskLevel) => {
  switch (riskLevel) {
    case "High":
      return "High Risk";
    case "Medium":
      return "Medium Risk";
    case "Low":
      return "Low Risk";
    default:
      return "Unknown Risk";
  }
};

// Main DashboardPage Component
const DashboardPage = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientPredictions, setPatientPredictions] = useState([]);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [patientError, setPatientError] = useState("");

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isAuthLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const [statsRes, recentRes] = await Promise.all([
        axios.get("http://localhost:5001/stats", { withCredentials: true }),
        axios.get("http://localhost:5001/history?per_page=5", {
          withCredentials: true,
        }),
      ]);

      setDashboardData({
        stats: statsRes.data,
        recentPredictions: recentRes.data.predictions,
      });
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patientId) => {
    setSelectedPatient(patientId);
    setLoadingPatient(true);
    setPatientError("");
    try {
      const response = await axios.get(
        `http://localhost:5001/history?patient_id=${patientId}&per_page=100`,
        { withCredentials: true }
      );
      setPatientPredictions(response.data.predictions);
    } catch (err) {
      setPatientError("Failed to load patient predictions");
      console.error(err);
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleCloseCharts = () => {
    setSelectedPatient(null);
    setPatientPredictions([]);
    setPatientError("");
  };

  const handleViewAll = () => {
    console.log("Navigate to history page");
  };

  if (isAuthLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <Loader size={32} />
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/LoginPage" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar
        userRole={user?.role}
        onLogout={logout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />
      <main className="main-content">
        <div className="dashboard-container">
          <WelcomeBanner user={user} />

          {loading ? (
            <div className="loading-screen">
              <div className="loading-content">
                <Loader size={32} />
                <p>Loading dashboard data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="error-screen">
              <AlertCircle size={48} />
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button className="btn-primary" onClick={fetchDashboardData}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <StatCard
                  icon={<BarChart2 size={24} />}
                  title="Total Predictions"
                  value={dashboardData.stats.total_predictions || 0}
                  description="Predictions made to date"
                  color="#3B82F6"
                />
                <StatCard
                  icon={<Activity size={24} />}
                  title="Last Prediction"
                  value={
                    dashboardData.stats.latest_prediction
                      ? formatRiskText(
                          dashboardData.stats.latest_prediction.risk_level
                        )
                      : "N/A"
                  }
                  description={
                    dashboardData.stats.latest_prediction
                      ? `${formatDistanceToNow(
                          new Date(
                            dashboardData.stats.latest_prediction.timestamp
                          )
                        )} ago`
                      : "No predictions"
                  }
                  color={
                    dashboardData.stats.latest_prediction
                      ? getRiskColor(
                          dashboardData.stats.latest_prediction.risk_level
                        )
                      : "#6B7280"
                  }
                />
                <StatCard
                  icon={<User size={24} color="white" />}
                  title="Account Created"
                  value={
                    user?.created_at
                      ? format(new Date(user.created_at), "MMM yyyy")
                      : "N/A"
                  }
                  description={
                    user?.created_at
                      ? `Member for ${formatDistanceToNow(
                          new Date(user.created_at)
                        )}`
                      : ""
                  }
                  color="#8B5CF6"
                />
              </div>

              <div className="dashboard-layout">
                <div className="dashboard-main">
                  <RecentPredictionsTable
                    predictions={dashboardData.recentPredictions}
                    onViewAll={handleViewAll}
                    onSelectPatient={handleSelectPatient}
                  />

                  {selectedPatient && (
                    <div className="patient-section">
                      {loadingPatient ? (
                        <div className="loading-content">
                          <Loader size={24} />
                          <p>Loading patient data...</p>
                        </div>
                      ) : patientError ? (
                        <div className="error-content">
                          <AlertCircle size={24} />
                          <p>{patientError}</p>
                        </div>
                      ) : (
                        <PatientChartSection 
                          predictions={patientPredictions} 
                          onClose={handleCloseCharts}
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="dashboard-sidebar">
                  <PredictionPieChart
                    riskDistribution={dashboardData.stats.risk_distribution}
                  />
                  <RecommendationsPanel
                    user={user}
                    stats={dashboardData.stats}
                    latestPrediction={dashboardData.stats.latest_prediction}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;