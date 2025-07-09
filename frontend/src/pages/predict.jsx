import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import { useAuth } from '../auth';
import { Navigate } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  History, 
  User, 
  LogOut, 
  Upload, 
  FilePlus, 
  Gamepad2, 
  BookOpen, 
  FolderSearch, 
  BarChart,
  Menu,
  X,
  AlertCircle,
  CheckCircle,
  Loader,
  Heart,
  Info
} from 'lucide-react';

const PredictPage = () => {
  const [formData, setFormData] = useState({
    N_Days: '',
    Drug: '',
    Age: '',
    Sex: '',
    Ascites: '',
    Hepatomegaly: '',
    Spiders: '',
    Edema: '',
    Bilirubin: '',
    Cholesterol: '',
    Albumin: '',
    Copper: '',
    Alk_Phos: '',
    SGOT: '',
    Tryglicerides: '',
    Platelets: '',
    Prothrombin: '',
    Stage: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const { user, isLoading: isAuthLoading, isAuthenticated, logout } = useAuth();
  const userRole = user?.role || 'Doctor';

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session authentication
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server response:', data); // Log detailed error
        throw new Error(data.error || `Prediction failed with status ${response.status}`);
      }

      setPrediction(data);
    } catch (error) {
      console.error('Fetch error:', error); // Log fetch errors
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      N_Days: '',
      Drug: '',
      Age: '',
      Sex: '',
      Ascites: '',
      Hepatomegaly: '',
      Spiders: '',
      Edema: '',
      Bilirubin: '',
      Cholesterol: '',
      Albumin: '',
      Copper: '',
      Alk_Phos: '',
      SGOT: '',
      Tryglicerides: '',
      Platelets: '',
      Prothrombin: '',
      Stage: ''
    });
    setPrediction(null);
    setError('');
  };

  return (
    <div className="app-container">
      <Sidebar 
        userRole={userRole} 
        onLogout={logout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />
      
      <main className="main-content">
        <div className="predict-container">
          <div className="predict-header">
            <div className="header-content">
              <Heart className="header-icon" />
              <div>
                <h1>Liver Disease Prediction</h1>
                <p>Enter patient data to predict liver disease status</p>
              </div>
            </div>
          </div>

          <div className="predict-form-container">
            <form onSubmit={handleSubmit} className="predict-form">
              <div className="form-sections">
                <div className="form-section">
                  <h3>Patient Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="Age">Age (years)</label>
                      <input
                        type="number"
                        id="Age"
                        name="Age"
                        value={formData.Age}
                        onChange={handleInputChange}
                        placeholder="Enter age"
                        min="0"
                        max="150"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="Sex">Sex</label>
                      <select
                        id="Sex"
                        name="Sex"
                        value={formData.Sex}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Sex</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="N_Days">N Days</label>
                      <input
                        type="number"
                        id="N_Days"
                        name="N_Days"
                        value={formData.N_Days}
                        onChange={handleInputChange}
                        placeholder="Number of days"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="Drug">Drug</label>
                      <select
                        id="Drug"
                        name="Drug"
                        value={formData.Drug}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Drug</option>
                        <option value="D-penicillamine">D-penicillamine</option>
                        <option value="Placebo">Placebo</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Clinical Signs</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="Ascites">Ascites</label>
                      <select
                        id="Ascites"
                        name="Ascites"
                        value={formData.Ascites}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select</option>
                        <option value="N">No</option>
                        <option value="Y">Yes</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="Hepatomegaly">Hepatomegaly</label>
                      <select
                        id="Hepatomegaly"
                        name="Hepatomegaly"
                        value={formData.Hepatomegaly}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select</option>
                        <option value="N">No</option>
                        <option value="Y">Yes</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="Spiders">Spiders</label>
                      <select
                        id="Spiders"
                        name="Spiders"
                        value={formData.Spiders}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select</option>
                        <option value="N">No</option>
                        <option value="Y">Yes</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="Edema">Edema</label>
                      <select
                        id="Edema"
                        name="Edema"
                        value={formData.Edema}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select</option>
                        <option value="N">No</option>
                        <option value="S">Slight</option>
                        <option value="Y">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Laboratory Results</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="Bilirubin">Bilirubin (mg/dl)</label>
                      <input
                        type="number"
                        id="Bilirubin"
                        name="Bilirubin"
                        value={formData.Bilirubin}
                        onChange={handleInputChange}
                        placeholder="Enter bilirubin level"
                        step="0.1"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="Cholesterol">Cholesterol (mg/dl)</label>
                      <input
                        type="number"
                        id="Cholesterol"
                        name="Cholesterol"
                        value={formData.Cholesterol}
                        onChange={handleInputChange}
                        placeholder="Enter cholesterol level"
                        step="0.1"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="Albumin">Albumin (gm/dl)</label>
                      <input
                        type="number"
                        id="Albumin"
                        name="Albumin"
                        value={formData.Albumin}
                        onChange={handleInputChange}
                        placeholder="Enter albumin level"
                        step="0.1"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="Copper">Copper (μg/day)</label>
                      <input
                        type="number"
                        id="Copper"
                        name="Copper"
                        value={formData.Copper}
                        onChange={handleInputChange}
                        placeholder="Enter copper level"
                        step="0.1"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="Alk_Phos">Alkaline Phosphatase (U/liter)</label>
                      <input
                        type="number"
                        id="Alk_Phos"
                        name="Alk_Phos"
                        value={formData.Alk_Phos}
                        onChange={handleInputChange}
                        placeholder="Enter alkaline phosphatase"
                        step="0.1"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="SGOT">SGOT (U/ml)</label>
                      <input
                        type="number"
                        id="SGOT"
                        name="SGOT"
                        value={formData.SGOT}
                        onChange={handleInputChange}
                        placeholder="Enter SGOT level"
                        step="0.1"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="Tryglicerides">Triglycerides (mg/dl)</label>
                      <input
                        type="number"
                        id="Tryglicerides"
                        name="Tryglicerides"
                        value={formData.Tryglicerides}
                        onChange={handleInputChange}
                        placeholder="Enter triglycerides level"
                        step="0.1"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="Platelets">Platelets (cubic ml/1000)</label>
                      <input
                        type="number"
                        id="Platelets"
                        name="Platelets"
                        value={formData.Platelets}
                        onChange={handleInputChange}
                        placeholder="Enter platelets count"
                        step="0.1"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="Prothrombin">Prothrombin Time (s)</label>
                      <input
                        type="number"
                        id="Prothrombin"
                        name="Prothrombin"
                        value={formData.Prothrombin}
                        onChange={handleInputChange}
                        placeholder="Enter prothrombin time"
                        step="0.1"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="Stage">Stage</label>
                      <select
                        id="Stage"
                        name="Stage"
                        value={formData.Stage}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Stage</option>
                        <option value="1">Stage 1</option>
                        <option value="2">Stage 2</option>
                        <option value="3">Stage 3</option>
                        <option value="4">Stage 4</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Reset Form
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? (
                    <>
                      <Loader className="btn-icon spinning" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <Activity className="btn-icon" />
                      Predict
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle className="alert-icon" />
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {prediction && (
            <div className="prediction-results">
              <div className="result-header">
                <CheckCircle className="result-icon" />
                <h3>Prediction Results</h3>
              </div>
              
              <div className="result-content">
                <div className="result-main">
                  <div className="status-display">
                    <span className={`status-badge ${prediction.risk_level.toLowerCase()}`}>
                      {prediction.predicted_status}
                    </span>
                    <div className="status-description">
                      <p>{prediction.status_description}</p>
                      <p className="risk-level">Risk Level: <strong>{prediction.risk_level}</strong></p>
                    </div>
                  </div>
                </div>
                
                <div className="probabilities">
                  <h4>Confidence Levels</h4>
                  <div className="prob-bars">
                    {Object.entries(prediction.probabilities).map(([status, prob]) => (
                      <div key={status} className="prob-bar">
                        <div className="prob-label">
                          <span>{status}</span>
                          <span>{(prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="prob-track">
                          <div 
                            className="prob-fill" 
                            style={{ width: `${prob * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="disclaimer">
                  <Info className="disclaimer-icon" />
                  <p>{prediction.disclaimer}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 280px;
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          color: white;
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
          overflow-y: auto;
          transition: all 0.3s ease;
          z-index: 1000;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
        }

        .sidebar.collapsed {
          width: 80px;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo-img {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: white;
          padding: 4px;
        }

        .logo-text {
          margin-left: 12px;
          font-size: 22px;
          font-weight: 700;
          color: white;
        }

        .collapse-toggle {
          position: absolute;
          right: 15px;
          top: 25px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          border-radius: 6px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .collapse-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .user-info {
          display: flex;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-details {
          margin-left: 12px;
        }

        .user-role {
          font-size: 14px;
          color: #bdc3c7;
        }

        .nav-items {
          list-style: none;
          padding: 0;
          margin: 20px 0;
        }

        .nav-item {
          margin-bottom: 4px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          color: white;
          text-decoration: none;
          transition: all 0.2s;
          border-radius: 0 25px 25px 0;
          margin-right: 15px;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(5px);
        }

        .nav-link.active {
          background: rgba(255, 255, 255, 0.2);
          border-right: 3px solid #3498db;
        }

        .nav-icon {
          margin-right: 12px;
        }

        .nav-label {
          font-size: 14px;
          font-weight: 500;
        }

        .sidebar-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 12px 20px;
          background: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(231, 76, 60, 0.2);
        }

        .mobile-menu-toggle {
          display: none;
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1100;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .mobile-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        .desktop-only {
          display: block;
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          
          .sidebar.mobile-open {
            transform: translateX(0);
          }
          
          .mobile-menu-toggle {
            display: block;
          }
          
          .mobile-overlay {
            display: block;
          }
          
          .desktop-only {
            display: none;
          }
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          margin-left: 280px;
          padding: 0;
          transition: margin-left 0.3s ease;
        }

        .sidebar.collapsed ~ .main-content {
          margin-left: 80px;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            padding-top: 70px;
          }
        }

        .predict-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .predict-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 10px;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          color: #fff;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .predict-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .predict-header p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }

        .predict-form-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 30px;
        }

        .predict-form {
          padding: 40px;
        }

        .form-sections {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .form-section {
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 30px;
        }

        .form-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .form-section h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .form-section h3::before {
          content: '';
          width: 4px;
          height: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 2px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
          background: white;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input::placeholder {
          color: #9ca3af;
        }

        .form-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-primary,
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          min-width: 120px;
          justify-content: center;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }

        .btn-secondary:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .btn-icon {
          width: 20px;
          height: 20px;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .alert {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .alert-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .alert-icon {
          width: 20px;
          height: 20px;
          margin-top: 2px;
        }

        .prediction-results {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-top: 30px;
        }

        .result-header {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 20px 40px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .result-icon {
          width: 28px;
          height: 28px;
        }

        .result-header h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .result-content {
          padding: 40px;
        }

        .result-main {
          margin-bottom: 30px;
        }

        .status-display {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.low {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.medium {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.high {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-description {
          flex: 1;
        }

        .status-description p {
          margin: 0 0 8px 0;
          color: #374151;
          font-size: 1rem;
        }

        .risk-level {
          font-weight: 600;
          color: #1f2937;
        }

        .probabilities {
          margin-bottom: 30px;
        }

        .probabilities h4 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
        }

        .prob-bars {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .prob-bar {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .prob-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 500;
        }

        .prob-track {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .prob-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 4px;
          transition: width 0.8s ease;
        }

        .disclaimer {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #fffbeb;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          color: #92400e;
        }

        .disclaimer-icon {
          width: 20px;
          height: 20px;
          margin-top: 2px;
        }

        .disclaimer p {
          margin: 0;
          font-size: 0.9rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          color: white;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          margin-bottom: 16px;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .predict-container {
            padding: 20px 15px;
          }

          .predict-form {
            padding: 30px 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .status-display {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .result-content {
            padding: 30px 20px;
          }

          .predict-header h1 {
            font-size: 2rem;
          }

          .header-content {
            flex-direction: column;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .predict-header h1 {
            font-size: 1.8rem;
          }

          .form-section h3 {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PredictPage;