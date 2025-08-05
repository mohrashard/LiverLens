import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import { useAuth } from '../auth';
import { Navigate } from 'react-router-dom';
import { 
  Activity, 
  Loader, 
  Heart, 
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import '../styles/predict.css';

const fieldDescriptions = {
  Patient_Name: 'The full name of the patient.',
  Patient_ID: 'A unique identifier for the patient.',
  N_Days: 'Select the date when the patient was enrolled in the study. The number of days will be calculated automatically based on today\'s date.',
  Drug: 'The type of drug given to the patient (D-penicillamine or Placebo).',
  Age: 'The patient’s age in years.',
  Sex: 'The patient’s sex (Male or Female).',
  Ascites: 'Whether there’s fluid buildup in the abdomen (Yes or No).',
  Hepatomegaly: 'Whether the liver is enlarged (Yes or No).',
  Spiders: 'Whether there are spider-like blood vessels on the skin (Yes or No).',
  Edema: 'Swelling due to fluid in the body’s tissues (No, Slight, or Yes).',
  Bilirubin: 'Level of bilirubin in the blood (mg/dl), related to liver function.',
  Cholesterol: 'Level of cholesterol in the blood (mg/dl).',
  Albumin: 'Level of albumin protein in the blood (gm/dl), indicates liver health.',
  Copper: 'Level of copper in the urine (μg/day), can signal liver issues.',
  Alk_Phos: 'Level of alkaline phosphatase in the blood (U/liter), a liver enzyme.',
  SGOT: 'Level of SGOT enzyme in the blood (U/ml), measures liver damage.',
  Tryglicerides: 'Level of triglycerides in the blood (mg/dl), a type of fat.',
  Platelets: 'Platelet count in the blood (cubic ml/1000), affects clotting.',
  Prothrombin: 'Time for blood to clot (seconds), linked to liver function.',
  Stage: 'The stage of liver disease (1 to 4), higher means more severe.',
};

const PredictPage = () => {
  const [formData, setFormData] = useState({
    Patient_Name: '',
    Patient_ID: '',
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
    Stage: '',
  });
  
  const [selectedDate, setSelectedDate] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
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
    return <Navigate to="/LoginPage" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server response:', data);
        throw new Error(data.error || `Prediction failed with status ${response.status}`);
      }

      setPrediction(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      Patient_Name: '',
      Patient_ID: '',
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
      Stage: '',
    });
    setSelectedDate('');
    setPrediction(null);
    setError('');
    setCurrentSlide(0);
  };

  const slides = [
    {
      title: 'Patient Information',
      fields: ['Patient_Name', 'Patient_ID', 'N_Days', 'Drug', 'Age', 'Sex'],
    },
    {
      title: 'Clinical Signs',
      fields: ['Ascites', 'Hepatomegaly', 'Spiders', 'Edema'],
    },
    {
      title: 'Laboratory Results',
      fields: [
        'Bilirubin', 'Cholesterol', 'Albumin', 'Copper', 'Alk_Phos', 'SGOT',
        'Tryglicerides', 'Platelets', 'Prothrombin', 'Stage',
      ],
    },
  ];

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const renderField = (field) => {
    const commonProps = {
      name: field,
      value: formData[field],
      onChange: handleInputChange,
      required: true,
    };

    switch (field) {
      case 'Patient_Name':
      case 'Patient_ID':
        return (
          <input
            type="text"
            {...commonProps}
            placeholder={`Enter ${field.replace('_', ' ')}`}
          />
        );
      case 'N_Days':
        return (
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if (e.target.value) {
                  const today = new Date();
                  const selected = new Date(e.target.value);
                  const days = Math.floor((today - selected) / (1000 * 60 * 60 * 24));
                  setFormData(prev => ({ ...prev, N_Days: days.toString() }));
                } else {
                  setFormData(prev => ({ ...prev, N_Days: '' }));
                }
              }}
              required
            />
            {formData.N_Days && <p>Days since enrollment: {formData.N_Days}</p>}
          </div>
        );
      case 'Drug':
        return (
          <select {...commonProps}>
            <option value="">Select Drug</option>
            <option value="D-penicillamine">D-penicillamine</option>
            <option value="Placebo">Placebo</option>
          </select>
        );
      case 'Sex':
        return (
          <select {...commonProps}>
            <option value="">Select Sex</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        );
      case 'Ascites':
      case 'Hepatomegaly':
      case 'Spiders':
        return (
          <select {...commonProps}>
            <option value="">Select</option>
            <option value="N">No</option>
            <option value="Y">Yes</option>
          </select>
        );
      case 'Edema':
        return (
          <select {...commonProps}>
            <option value="">Select</option>
            <option value="N">No</option>
            <option value="S">Slight</option>
            <option value="Y">Yes</option>
          </select>
        );
      case 'Stage':
        return (
          <select {...commonProps}>
            <option value="">Select Stage</option>
            <option value="1">Stage 1</option>
            <option value="2">Stage 2</option>
            <option value="3">Stage 3</option>
            <option value="4">Stage 4</option>
          </select>
        );
      default:
        return (
          <input
            type="number"
            step="0.1"
            min="0"
            {...commonProps}
            placeholder={`Enter ${field.replace('_', ' ')}`}
          />
        );
    }
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
              <div className="form-section">
                <h3>{slides[currentSlide].title}</h3>
                <div className="form-grid">
                  {slides[currentSlide].fields.map((field) => (
                    <div key={field} className="form-group">
                      <label htmlFor={field}>{field.replace('_', ' ')}</label>
                      <p className="field-description">{fieldDescriptions[field]}</p>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                {currentSlide > 0 && (
                  <button type="button" onClick={handlePrevSlide} className="btn-secondary">
                    Previous
                  </button>
                )}
                {currentSlide < slides.length - 1 ? (
                  <button type="button" onClick={handleNextSlide} className="btn-primary">
                    Next
                  </button>
                ) : (
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
                )}
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Reset Form
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
                
                <div className="recommendation">
                  <h4>Recommendation</h4>
                  <p>
                    {prediction.predicted_status === 'D'
                      ? 'Immediate medical attention is required. Please consult your healthcare provider as soon as possible.'
                      : prediction.predicted_status === 'CL'
                      ? 'The condition is being managed, but regular check-ups are recommended.'
                      : 'The liver is functioning adequately. Maintain a healthy lifestyle and regular check-ups.'}
                  </p>
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
    </div>
  );
};

export default PredictPage;