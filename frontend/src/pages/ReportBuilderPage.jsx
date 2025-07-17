import React, { useState, useEffect } from "react";
import { useAuth } from "../auth";
import { Navigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sidebar";
import "../styles/reportbuilder.css";
import {
  FileText,
  User,
  ClipboardEdit,
  Download,
  AlertCircle,
  CheckCircle,
  Loader,
  Activity,
  Calendar,
  TrendingUp,
  Shield,
  Clock,
  UserCheck,
  BarChart3,
  HeartPulse,
  Stethoscope,
  FileBarChart,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Eye,
  FileDown,
  X
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Cell
} from "recharts";

const ReportBuilderPage = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [chartData, setChartData] = useState([]);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    if (predictions.length > 0) {
      const formattedData = predictions
        .map((pred) => {
          const date = new Date(pred.timestamp).toLocaleDateString();
          return {
            date,
            Bilirubin: pred.input_data.Bilirubin,
            Cholesterol: pred.input_data.Cholesterol,
            Albumin: pred.input_data.Albumin,
            SGOT: pred.input_data.SGOT,
            Platelets: pred.input_data.Platelets,
            Prothrombin: pred.input_data.Prothrombin,
          };
        })
        .reverse();
      setChartData(formattedData);
    }
  }, [predictions]);

  if (isAuthLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
        color: 'white'
      }}>
        <Loader size={48} className="animate-spin mb-4" />
        <p className="text-xl">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/LoginPage" replace />;
  }

  if (user?.role !== "Doctor") {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
        color: 'white',
        textAlign: 'center'
      }}>
        <AlertCircle size={64} className="mb-4 text-red-400" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-lg opacity-80">This feature is only available to doctors.</p>
      </div>
    );
  }

  const fetchPatientPredictions = async () => {
    if (!patientId) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `http://localhost:5001/history?patient_id=${patientId}&server_pagination=false`,
        { withCredentials: true }
      );

      if (response.data.predictions.length === 0) {
        setError("No predictions found for this patient ID");
        return;
      }

      const sortedPredictions = [...response.data.predictions].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setPredictions(sortedPredictions);
      setLatestPrediction(sortedPredictions[0]);
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError(err.response?.data?.error || "Failed to fetch patient data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatientPredictions();
  };

const generatePDF = async () => {
  setGeneratingPdf(true);
  try {
    const html2pdf = (await import("html2pdf.js")).default;
    
    // Create a clean container for PDF content
    const pdfElement = document.createElement('div');
    pdfElement.innerHTML = generatePDFContent();
    pdfElement.style.cssText = `
      width: 210mm;
      min-height: 297mm;
      margin: 0;
      padding: 0;
      background: white;
      color: black;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    // Add styles to document head temporarily
    const styleSheet = document.createElement('style');
    styleSheet.textContent = getPDFStyles();
    document.head.appendChild(styleSheet);
    
    // Append to body temporarily for rendering
    document.body.appendChild(pdfElement);
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `LiverLens_Report_${patientId}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 1.0 
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        avoid: ['.pdf-section', '.pdf-clinical-table']
      }
    };

    await html2pdf().set(opt).from(pdfElement).save();
    
    // Cleanup
    document.body.removeChild(pdfElement);
    document.head.removeChild(styleSheet);
    
  } catch (error) {
    console.error("PDF generation failed:", error);
    setError("Failed to generate PDF. Please try again.");
  } finally {
    setGeneratingPdf(false);
  }
};

const getPDFStyles = () => `
  @page {
    margin: 10mm;
    size: A4;
    background: white;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.5;
    color: #000000;
    background: #ffffff;
    font-size: 12px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .pdf-container {
    max-width: 100%;
    margin: 0;
    padding: 20px;
    background: #ffffff;
    color: #000000;
    min-height: 100vh;
  }
  
  .pdf-header {
    text-align: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 2px solid #000000;
    background: #ffffff;
  }
  
  .pdf-logo {
    font-size: 24px;
    font-weight: bold;
    color: #000000;
    margin-bottom: 8px;
  }
  
  .pdf-title {
    font-size: 18px;
    color: #000000;
    margin-bottom: 10px;
    font-weight: 600;
  }
  
  .pdf-meta {
    font-size: 11px;
    color: #333333;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .pdf-meta span {
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 3px;
    border: 1px solid #dee2e6;
  }
  
  .pdf-two-column {
    display: flex;
    gap: 20px;
    margin-top: 20px;
  }
  
  .pdf-column {
    flex: 1;
  }
  
  .pdf-section {
    margin-bottom: 20px;
    break-inside: avoid;
    page-break-inside: avoid;
    background: #ffffff;
  }
  
  .pdf-section-title {
    font-size: 14px;
    font-weight: bold;
    color: #000000;
    margin-bottom: 12px;
    padding-bottom: 5px;
    border-bottom: 1px solid #dee2e6;
    background: #f8f9fa;
    padding: 8px;
    border-radius: 4px;
  }
  
  .pdf-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .pdf-info-item {
    display: flex;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #dee2e6;
    font-size: 11px;
  }
  
  .pdf-info-label {
    font-weight: bold;
    color: #000000;
    margin-right: 8px;
    min-width: 80px;
  }
  
  .pdf-info-value {
    color: #333333;
    flex: 1;
  }
  
  .pdf-clinical-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 10px;
    background: #ffffff;
    border: 1px solid #000000;
  }
  
  .pdf-clinical-table th,
  .pdf-clinical-table td {
    padding: 6px 8px;
    text-align: left;
    border: 1px solid #000000;
    background: #ffffff;
  }
  
  .pdf-clinical-table th {
    background: #f8f9fa;
    font-weight: bold;
    color: #000000;
    border-bottom: 2px solid #000000;
  }
  
  .pdf-clinical-table tr:nth-child(even) {
    background: #f8f9fa;
  }
  
  .pdf-clinical-table tr:nth-child(odd) {
    background: #ffffff;
  }
  
  .pdf-risk-badge {
    display: block;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    margin: 12px 0;
    border: 2px solid #000000;
  }
  
  .pdf-risk-high {
    background: #ffffff;
    color: #dc2626;
    border-color: #dc2626;
  }
  
  .pdf-risk-medium {
    background: #ffffff;
    color: #d97706;
    border-color: #d97706;
  }
  
  .pdf-risk-low {
    background: #ffffff;
    color: #16a34a;
    border-color: #16a34a;
  }
  
  .pdf-confidence-section {
    margin: 12px 0;
  }
  
  .pdf-confidence-section h3 {
    font-size: 12px;
    margin-bottom: 8px;
    color: #000000;
  }
  
  .pdf-confidence-item {
    display: flex;
    align-items: center;
    margin: 8px 0;
    padding: 6px;
    background: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #dee2e6;
  }
  
  .pdf-confidence-label {
    font-weight: bold;
    width: 100px;
    color: #000000;
    font-size: 10px;
  }
  
  .pdf-confidence-bar {
    flex: 1;
    height: 16px;
    background: #e9ecef;
    border-radius: 8px;
    overflow: hidden;
    margin: 0 8px;
    border: 1px solid #dee2e6;
  }
  
  .pdf-confidence-fill {
    height: 100%;
    background: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: bold;
    font-size: 9px;
    min-width: 30px;
  }
  
  .pdf-notes-section {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    border: 1px solid #dee2e6;
    margin: 12px 0;
  }
  
  .pdf-notes-content {
    color: #000000;
    line-height: 1.5;
    font-size: 11px;
  }
  
  .pdf-footer {
    margin-top: 30px;
    padding-top: 15px;
    border-top: 1px solid #dee2e6;
    text-align: center;
    font-size: 10px;
    color: #666666;
    background: #ffffff;
  }
  
  .pdf-footer p {
    margin: 3px 0;
  }
  
  .pdf-disclaimer {
    background: #fff3cd;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #ffeaa7;
    margin: 15px 0;
    font-size: 10px;
    color: #856404;
  }
  
  .pdf-disclaimer strong {
    color: #000000;
  }
  
  /* Print-specific styles */
  @media print {
    .pdf-container {
      padding: 0;
      margin: 0;
      background: white !important;
    }
    
    .pdf-section {
      page-break-inside: avoid;
    }
    
    .pdf-clinical-table {
      page-break-inside: avoid;
    }
    
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`;

const generatePDFContent = () => {
  const currentDate = new Date().toLocaleDateString();
  const reportDate = latestPrediction ? new Date(latestPrediction.timestamp).toLocaleDateString() : 'N/A';
  
  return `
    <div class="pdf-container">
      <div class="pdf-header">
        <div class="pdf-logo">🩺 LiverLens</div>
        <h1 class="pdf-title">Liver Health Assessment Report</h1>
        <div class="pdf-meta">
          <span><strong>Generated:</strong> ${currentDate}</span>
          <span><strong>Physician:</strong> Dr. ${user?.full_name || 'Unknown'}</span>
          <span><strong>Report ID:</strong> LLR-${patientId}-${Date.now()}</span>
        </div>
      </div>

      <div class="pdf-two-column">
        <div class="pdf-column">
          <div class="pdf-section">
            <h2 class="pdf-section-title">📋 Patient Information</h2>
            <div class="pdf-info-grid">
              <div class="pdf-info-item">
                <span class="pdf-info-label">Patient ID:</span>
                <span class="pdf-info-value">${patientId}</span>
              </div>
              <div class="pdf-info-item">
                <span class="pdf-info-label">Name:</span>
                <span class="pdf-info-value">${latestPrediction?.input_data?.Patient_Name || 'N/A'}</span>
              </div>
              <div class="pdf-info-item">
                <span class="pdf-info-label">Assessment:</span>
                <span class="pdf-info-value">${reportDate}</span>
              </div>
              <div class="pdf-info-item">
                <span class="pdf-info-label">Age:</span>
                <span class="pdf-info-value">${latestPrediction?.input_data?.Age || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="pdf-section">
            <h2 class="pdf-section-title">🤖 AI Prediction</h2>
            ${renderPredictionForPDF()}
          </div>

          <div class="pdf-section">
            <h2 class="pdf-section-title">📝 Clinical Notes</h2>
            <div class="pdf-notes-section">
              <div class="pdf-notes-content">
                ${doctorNotes || 'No clinical notes provided for this assessment.'}
              </div>
            </div>
          </div>
        </div>

        <div class="pdf-column">
          <div class="pdf-section">
            <h2 class="pdf-section-title">🔬 Clinical Data</h2>
            ${renderClinicalTableForPDF()}
          </div>
        </div>
      </div>

      <div class="pdf-disclaimer">
        <strong>⚠️ Medical Disclaimer:</strong> This AI-generated report is designed to support clinical decision-making and should not replace professional medical judgment. All predictions and recommendations require validation by qualified healthcare professionals.
      </div>

      <div class="pdf-footer">
        <p><strong>LiverLens AI-Powered Liver Health Assessment System</strong></p>
        <p>© ${new Date().getFullYear()} LiverLens Healthcare Technology. Confidential Medical Report.</p>
        <p>This report contains confidential patient information and should be handled in accordance with HIPAA regulations.</p>
      </div>
    </div>
  `;
};

const renderPredictionForPDF = () => {
  if (!latestPrediction) return '<p>No prediction data available</p>';

  const riskClass = latestPrediction.risk_level.toLowerCase();
  const maxConfidence = Math.max(...Object.values(latestPrediction.probabilities));
  const topPredictions = Object.entries(latestPrediction.probabilities)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  const confidenceItems = topPredictions.map(
    ([status, prob]) => `
      <div class="pdf-confidence-item">
        <span class="pdf-confidence-label">${status}:</span>
        <div class="pdf-confidence-bar">
          <div class="pdf-confidence-fill" style="width: ${prob * 100}%">
            ${(prob * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    `
  ).join('');

  return `
    <div class="pdf-risk-badge pdf-risk-${riskClass}">
      ${latestPrediction.risk_level} Risk Level: ${latestPrediction.prediction}
    </div>
    <div class="pdf-confidence-section">
      <h3>Prediction Confidence Levels:</h3>
      ${confidenceItems}
    </div>
    <p style="margin-top: 10px; font-size: 10px; color: #666666;">
      <strong>Analysis Summary:</strong> Evaluation of ${Object.keys(latestPrediction.input_data).length} clinical parameters 
      with ${(maxConfidence * 100).toFixed(1)}% highest confidence level.
    </p>
  `;
};

const renderClinicalTableForPDF = () => {
  if (!latestPrediction || !latestPrediction.input_data) {
    return '<p style="text-align: center; color: #666666;">No clinical data available</p>';
  }

  const { input_data } = latestPrediction;
  const excludedFields = ["Patient_Name", "Patient_ID"];
  const fieldNames = Object.keys(input_data).filter(
    (field) => !excludedFields.includes(field)
  );

  const keyParams = ['Age', 'Sex', 'Bilirubin', 'Albumin', 'SGOT', 'Platelets', 'Prothrombin', 'Stage'];
  const displayFields = keyParams.filter(field => fieldNames.includes(field));

  const rows = displayFields.map((field) => {
    const value = input_data[field];
    const displayName = field.replace(/_/g, " ");
    
    let displayValue = value;
    if (value === null || value === undefined || value === "") {
      displayValue = "N/A";
    } else if (typeof value === 'number') {
      displayValue = value.toFixed(2);
    } else {
      displayValue = String(value);
    }
    
    return `
      <tr>
        <td><strong>${displayName}</strong></td>
        <td>${displayValue}</td>
      </tr>
    `;
  }).join('');

  return `
    <table class="pdf-clinical-table">
      <thead>
        <tr>
          <th>Clinical Parameter</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

  const renderClinicalTable = () => {
    if (!latestPrediction || !latestPrediction.input_data) {
      return (
        <div className="no-data">
          <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-500">No clinical data available</p>
        </div>
      );
    }

    const { input_data } = latestPrediction;
    const excludedFields = ["Patient_Name", "Patient_ID"];
    const fieldNames = Object.keys(input_data).filter(
      (field) => !excludedFields.includes(field)
    );

    if (fieldNames.length === 0) {
      return (
        <div className="no-data">
          <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-500">No clinical parameters found</p>
        </div>
      );
    }

    const expectedParams = [
      'N_Days', 'Drug', 'Age', 'Sex', 'Ascites', 'Hepatomegaly',
      'Spiders', 'Edema', 'Bilirubin', 'Cholesterol', 'Albumin',
      'Copper', 'Alk_Phos', 'SGOT', 'Tryglicerides', 'Platelets',
      'Prothrombin', 'Stage'
    ];

    const sortedFields = fieldNames.sort((a, b) => {
      const aIndex = expectedParams.indexOf(a);
      const bIndex = expectedParams.indexOf(b);
      
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return (
      <div className="clinical-table-container">
        <table className="clinical-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedFields.map((field) => {
              const value = input_data[field];
              const displayName = field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
              
              let displayValue = value;
              if (value === null || value === undefined || value === "") {
                displayValue = "N/A";
              } else if (typeof value === 'number') {
                displayValue = value.toFixed(2);
              } else {
                displayValue = String(value);
              }
              
              const getStatusIcon = () => {
                if (displayValue === "N/A") return <Info className="w-4 h-4 text-gray-400" />;
                if (typeof value === 'number') {
                  if (field === 'Bilirubin' && value > 1.2) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
                  if (field === 'Albumin' && value < 3.5) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
                  return <CheckCircle2 className="w-4 h-4 text-green-500" />;
                }
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
              };
              
              return (
                <tr key={field}>
                  <td className="parameter-name">{displayName}</td>
                  <td className="parameter-value">{displayValue}</td>
                  <td className="parameter-status">{getStatusIcon()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRiskBadge = () => {
    if (!latestPrediction) return null;

    const riskClass = latestPrediction.risk_level.toLowerCase();
    const getRiskIcon = () => {
      switch (riskClass) {
        case 'high': return <AlertTriangle className="w-6 h-6" />;
        case 'medium': return <AlertCircle className="w-6 h-6" />;
        case 'low': return <CheckCircle className="w-6 h-6" />;
        default: return <Info className="w-6 h-6" />;
      }
    };

    return (
      <div className={`risk-badge risk-${riskClass}`}>
        <div className="risk-icon">{getRiskIcon()}</div>
        <div className="risk-content">
          <span className="risk-level">{latestPrediction.risk_level} Risk</span>
          <span className="risk-prediction">{latestPrediction.prediction}</span>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PreviewModal = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>
              <FileText className="w-6 h-6" />
              Report Preview
            </h2>
            <button className="modal-close" onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="modal-body">
            <div className="pdf-preview-content" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <Sidebar userRole={user?.role} />
      
      <main className="main-content">
        <div className="report-builder-container">
          {/* Header */}
          <div className="report-header">
            <div className="header-content">
              <div className="header-icon-wrapper">
                <FileBarChart className="header-icon" />
              </div>
              <div className="header-text">
                <h1>Patient Report Builder</h1>
                <p>Generate comprehensive AI-powered liver health assessments</p>
              </div>
            </div>
          </div>

          {/* Patient Search Section */}
          <section className="search-section">
            <div className="section-header">
              <UserCheck className="section-icon" />
              <h2>Patient Identification</h2>
            </div>
            <form onSubmit={handleSearch} className="search-form">
              <div className="form-group">
                <label htmlFor="patientId">
                  <User className="w-5 h-5" />
                  Patient ID
                </label>
                <input
                  type="text"
                  id="patientId"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter patient ID (e.g., P001)"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <Loader className="btn-icon animate-spin" />
                    Loading Patient Data...
                  </>
                ) : (
                  <>
                    <Activity className="btn-icon" />
                    Load Patient Data
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error">
              <AlertCircle className="alert-icon" />
              <div className="alert-content">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Main Content */}
          {latestPrediction && (
            <>
              {/* Patient Summary */}
              <section className="patient-summary">
                <div className="summary-header">
                  <div className="summary-item">
                    <User className="summary-icon" />
                    <div>
                      <span className="summary-label">Patient</span>
                      <span className="summary-value">{latestPrediction.input_data.Patient_Name || patientId}</span>
                    </div>
                  </div>
                  <div className="summary-item">
                    <Calendar className="summary-icon" />
                    <div>
                      <span className="summary-label">Assessment Date</span>
                      <span className="summary-value">
                        {new Date(latestPrediction.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="summary-item">
                    <Clock className="summary-icon" />
                    <div>
                      <span className="summary-label">Total Assessments</span>
                      <span className="summary-value">{predictions.length}</span>
                    </div>
                  </div>
                  <div className="summary-item">
                    <Stethoscope className="summary-icon" />
                    <div>
                      <span className="summary-label">Physician</span>
                      <span className="summary-value">Dr. {user?.full_name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Clinical Data Section */}
              <section className="clinical-section">
                <div className="section-header">
                  <HeartPulse className="section-icon" />
                  <h2>Clinical Laboratory Data</h2>
                </div>
                <div className="clinical-content">
                  {renderClinicalTable()}
                </div>
              </section>

              {/* Prediction Result Section */}
              <section className="prediction-section">
                <div className="section-header">
                  <Shield className="section-icon" />
                  <h2>AI Prediction Analysis</h2>
                </div>
                <div className="prediction-content">
                  {renderRiskBadge()}
                  
                  <div className="confidence-section">
                    <h3>
                      <BarChart3 className="w-5 h-5" />
                      Confidence Levels
                    </h3>
                    <div className="confidence-grid">
                      {Object.entries(latestPrediction.probabilities).map(([status, prob]) => (
                        <div key={status} className="confidence-item">
                          <div className="confidence-header">
                            <span className="confidence-label">{status}</span>
                            <span className="confidence-value">{(prob * 100).toFixed(1)}%</span>
                          </div>
                          <div className="confidence-bar">
                            <div 
                              className="confidence-fill" 
                              style={{ width: `${prob * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="prediction-stats">
                    <div className="stat-item">
                      <Eye className="stat-icon" />
                      <div>
                        <span className="stat-label">Parameters Analyzed</span>
                        <span className="stat-value">{Object.keys(latestPrediction.input_data).length}</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <TrendingUp className="stat-icon" />
                      <div>
                        <span className="stat-label">Highest Confidence</span>
                        <span className="stat-value">
                          {(Math.max(...Object.values(latestPrediction.probabilities)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Trend Analysis Section */}
              {predictions.length > 1 && (
                <section className="trend-section">
                  <div className="section-header">
                    <TrendingUp className="section-icon" />
                    <h2>Biomarker Trend Analysis</h2>
                  </div>
                  <div className="chart-container">
                    <div className="chart-header">
                      <h3>Key Biomarkers Over Time</h3>
                      <p>Tracking {predictions.length} assessments</p>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <defs>
                          <linearGradient id="colorBilirubin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff7300" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ff7300" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorAlbumin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#387908" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#387908" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorSGOT" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0088fe" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0088fe" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis 
                          dataKey="date" 
                          angle={-45} 
                          textAnchor="end" 
                          height={70}
                          tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="Bilirubin"
                          stroke="#ff7300"
                          fillOpacity={1}
                          fill="url(#colorBilirubin)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="Albumin"
                          stroke="#387908"
                          fillOpacity={1}
                          fill="url(#colorAlbumin)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="SGOT"
                          stroke="#0088fe"
                          fillOpacity={1}
                          fill="url(#colorSGOT)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {/* Clinical Notes Section */}
              <section className="notes-section">
                <div className="section-header">
                  <ClipboardEdit className="section-icon" />
                  <h2>Clinical Notes & Recommendations</h2>
                </div>
                <div className="notes-content">
                  <textarea
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Enter your clinical observations, recommendations, and follow-up instructions..."
                    rows={8}
                  />
                  <div className="notes-tips">
                    <h4>💡 Documentation Tips:</h4>
                    <ul>
                      <li>Include clinical interpretation of AI predictions</li>
                      <li>Note any relevant patient history or symptoms</li>
                      <li>Specify follow-up recommendations and timelines</li>
                      <li>Document any additional tests or consultations needed</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Actions Section */}
              <section className="actions-section">
                <div className="actions-header">
                  <h2>Report Actions</h2>
                  <p>Generate and manage your comprehensive liver health report</p>
                </div>
                <div className="actions-grid">
                  <button 
                    onClick={() => setShowPdfPreview(true)} 
                    className="btn-secondary"
                  >
                    <Eye className="btn-icon" />
                    Preview Report
                  </button>
                  <button 
                    onClick={generatePDF} 
                    disabled={generatingPdf}
                    className="btn-primary"
                  >
                    {generatingPdf ? (
                      <>
                        <Loader className="btn-icon animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <FileDown className="btn-icon" />
                        Generate PDF Report
                      </>
                    )}
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* PDF Preview Modal */}
      <PreviewModal 
        isOpen={showPdfPreview} 
        onClose={() => setShowPdfPreview(false)} 
        content={generatePDFContent()} 
      />
    </div>
  );
};

export default ReportBuilderPage;