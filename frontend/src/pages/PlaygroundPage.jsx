// PlaygroundPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Activity, 
  RefreshCw, 
  FlaskConical, 
  Info, 
  Save, 
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Loader,
  Lightbulb,
  ThumbsUp
} from 'lucide-react';
import { useAuth } from '../auth';
import { Navigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import '../styles/PlaygroundPage.css';

const PlaygroundPage = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated, logout } = useAuth();
  const userRole = user?.role || 'Doctor';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [inputs, setInputs] = useState({
    Age: 35,
    Sex: 'M',
    Bilirubin: 0.7,
    Cholesterol: 180,
    Albumin: 4.0,
    Copper: 100,
    Alk_Phos: 80,
    SGOT: 30,
    Platelets: 250,
    Prothrombin: 10.0,
    Stage: 2
  });
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('Healthy Adult');
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const featureMetadata = {
    Age: { min: 0, max: 100, step: 1, unit: 'years', normalRange: '18-65' },
    Sex: { unit: '', normalRange: 'M/F' },
    Bilirubin: { min: 0.1, max: 20, step: 0.1, unit: 'mg/dL', normalRange: '0.1-1.2' },
    Cholesterol: { min: 100, max: 400, step: 1, unit: 'mg/dL', normalRange: '<200' },
    Albumin: { min: 2, max: 6, step: 0.1, unit: 'g/dL', normalRange: '3.4-5.4' },
    Copper: { min: 50, max: 300, step: 1, unit: 'μg/dL', normalRange: '70-140' },
    Alk_Phos: { min: 20, max: 500, step: 1, unit: 'U/L', normalRange: '44-147' },
    SGOT: { min: 5, max: 500, step: 1, unit: 'U/L', normalRange: '10-40' },
    Platelets: { min: 50, max: 500, step: 1, unit: 'K/μL', normalRange: '150-450' },
    Prothrombin: { min: 5, max: 20, step: 0.1, unit: 'seconds', normalRange: '10-13' },
    Stage: { min: 1, max: 4, step: 1, unit: 'stage', normalRange: '1-4' }
  };

  const presetProfiles = {
    'Healthy Adult': {
      Age: 35,
      Sex: 'M',
      Bilirubin: 0.7,
      Cholesterol: 180,
      Albumin: 4.0,
      Copper: 100,
      Alk_Phos: 80,
      SGOT: 30,
      Platelets: 250,
      Prothrombin: 10.0,
      Stage: 2
    },
    'Viral Hepatitis': {
      Age: 45,
      Sex: 'M',
      Bilirubin: 3.5,
      Cholesterol: 160,
      Albumin: 3.2,
      Copper: 150,
      Alk_Phos: 200,
      SGOT: 120,
      Platelets: 180,
      Prothrombin: 13.5,
      Stage: 3
    },
    'Fatty Liver': {
      Age: 50,
      Sex: 'F',
      Bilirubin: 1.2,
      Cholesterol: 230,
      Albumin: 3.8,
      Copper: 120,
      Alk_Phos: 130,
      SGOT: 55,
      Platelets: 220,
      Prothrombin: 11.0,
      Stage: 2
    },
    'Cirrhosis Suspect': {
      Age: 60,
      Sex: 'M',
      Bilirubin: 5.8,
      Cholesterol: 150,
      Albumin: 2.9,
      Copper: 200,
      Alk_Phos: 250,
      SGOT: 110,
      Platelets: 90,
      Prothrombin: 15.0,
      Stage: 4
    }
  };

  const tooltips = {
    Age: 'Patient age in years. Liver disease risk increases with age.',
    Sex: 'Patient sex. Some liver conditions have different prevalence between sexes.',
    Bilirubin: 'Total bilirubin measures all bilirubin in blood. High levels indicate liver dysfunction.',
    Cholesterol: 'Blood cholesterol levels. Abnormal levels may indicate metabolic liver disease.',
    Albumin: 'Protein produced by the liver. Low levels indicate chronic liver disease or malnutrition.',
    Copper: 'Copper levels. Elevated in Wilson\'s disease and chronic cholestasis.',
    Alk_Phos: 'Alkaline phosphatase. Elevated in liver disease and bile duct obstruction.',
    SGOT: 'AST enzyme found in liver, heart and muscles. Elevated in liver damage.',
    Platelets: 'Platelet count. Low platelets may indicate advanced liver disease.',
    Prothrombin: 'Blood clotting time. Prolonged time indicates impaired liver function.',
    Stage: 'Disease progression stage from 1 (mild) to 4 (severe)'
  };

  // Generate input suggestions based on current values
  const generateInputSuggestions = () => {
    const suggestions = [];
    
    // Check for out-of-range values
    Object.entries(inputs).forEach(([feature, value]) => {
      if (isValueOutOfRange(feature, value)) {
        const metadata = featureMetadata[feature];
        const normalRange = metadata?.normalRange;
        
        if (feature === 'Bilirubin' && value > 1.2) {
          suggestions.push({
            type: 'warning',
            text: `Bilirubin (${value} mg/dL) is elevated. Consider liver function tests and potential hepatic dysfunction.`,
            parameter: feature
          });
        } else if (feature === 'Cholesterol' && value > 200) {
          suggestions.push({
            type: 'warning',
            text: `Cholesterol (${value} mg/dL) is elevated. This may indicate metabolic liver disease or cardiovascular risk.`,
            parameter: feature
          });
        } else if (feature === 'Albumin' && value < 3.4) {
          suggestions.push({
            type: 'alert',
            text: `Albumin (${value} g/dL) is low. This suggests chronic liver disease or malnutrition.`,
            parameter: feature
          });
        } else if (feature === 'Copper' && value > 140) {
          suggestions.push({
            type: 'warning',
            text: `Copper (${value} μg/dL) is elevated. Consider Wilson's disease or chronic cholestasis.`,
            parameter: feature
          });
        } else if (feature === 'Alk_Phos' && value > 147) {
          suggestions.push({
            type: 'warning',
            text: `Alkaline phosphatase (${value} U/L) is elevated. This may indicate bile duct obstruction.`,
            parameter: feature
          });
        } else if (feature === 'SGOT' && value > 40) {
          suggestions.push({
            type: 'warning',
            text: `SGOT/AST (${value} U/L) is elevated. This indicates liver cell damage.`,
            parameter: feature
          });
        } else if (feature === 'Platelets' && value < 150) {
          suggestions.push({
            type: 'alert',
            text: `Platelets (${value} K/μL) are low. This may indicate advanced liver disease or portal hypertension.`,
            parameter: feature
          });
        } else if (feature === 'Prothrombin' && value > 13) {
          suggestions.push({
            type: 'warning',
            text: `Prothrombin time (${value} seconds) is prolonged. This suggests impaired liver synthetic function.`,
            parameter: feature
          });
        } else if (normalRange) {
          suggestions.push({
            type: 'warning',
            text: `${feature.replace(/_/g, ' ')} (${value} ${metadata?.unit || ''}) is outside normal range (${normalRange}).`,
            parameter: feature
          });
        }
      }
    });

    // Add clinical correlation suggestions
    if (inputs.Bilirubin > 2.0 && inputs.SGOT > 80) {
      suggestions.push({
        type: 'info',
        text: 'Elevated bilirubin with high SGOT suggests acute hepatocellular injury. Monitor closely.',
        parameter: 'multiple'
      });
    }

    if (inputs.Albumin < 3.0 && inputs.Platelets < 100) {
      suggestions.push({
        type: 'alert',
        text: 'Low albumin with thrombocytopenia may indicate advanced cirrhosis with portal hypertension.',
        parameter: 'multiple'
      });
    }

    if (inputs.Cholesterol < 150 && inputs.Albumin < 3.5) {
      suggestions.push({
        type: 'info',
        text: 'Low cholesterol with decreased albumin suggests reduced hepatic synthetic function.',
        parameter: 'multiple'
      });
    }

    // Add positive suggestions for normal values
    if (suggestions.length === 0) {
      const normalValues = Object.entries(inputs).filter(([feature, value]) => 
        !isValueOutOfRange(feature, value)
      );
      
      if (normalValues.length >= 8) {
        suggestions.push({
          type: 'info',
          text: 'Most clinical parameters are within normal ranges, suggesting good liver function.',
          parameter: 'overall'
        });
      }
    }

    return suggestions;
  };

  // Get prediction only (without saving to database)
  const fetchPrediction = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const requestData = {
        ...inputs,
        Patient_Name: "Playground Simulation",
        Patient_ID: `PLAYGROUND-${Date.now()}`,
        N_Days: inputs.Age * 365.25,
        Drug: 'Placebo',
        Ascites: 'N',
        Hepatomegaly: 'N',
        Spiders: 'N',
        Edema: 'N',
        Tryglicerides: 100
      };
      
      console.log('Making prediction request with data:', requestData);
      
      // Use a new endpoint for playground predictions that don't save to database
      const response = await axios.post(
        'http://localhost:5001/predict-only', 
        requestData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Prediction response:', response.data);
      setPrediction(response.data);
    } catch (err) {
      console.error('Prediction error:', err);
      
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.error || 'Server error occurred';
        setError(`Server Error: ${errorMessage}`);
        console.error('Server error:', err.response.data);
      } else if (err.request) {
        // Request was made but no response received
        setError('No response from server. Please check if the prediction service is running.');
        console.error('No response:', err.request);
      } else {
        // Something else happened
        setError('Failed to make request. Please try again.');
        console.error('Request error:', err.message);
      }
      
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }, [inputs]);

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    const timeout = setTimeout(() => {
      fetchPrediction();
    }, 500);
    
    setDebounceTimeout(timeout);
    
    return () => clearTimeout(timeout);
  }, [inputs, fetchPrediction]);

  const handleInputChange = (feature, value) => {
    setInputs(prev => ({
      ...prev,
      [feature]: feature === 'Sex' ? value : parseFloat(value)
    }));
    // Clear save success message when inputs change
    setSaveSuccess(false);
  };

  const applyPreset = (presetName) => {
    setSelectedPreset(presetName);
    setInputs(presetProfiles[presetName]);
    setSaveSuccess(false);
  };

  const saveSimulation = async () => {
    if (!prediction) {
      setError('No prediction available to save');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const simulationData = {
        ...inputs,
        Patient_Name: "Playground Simulation",
        Patient_ID: `PLAYGROUND-${Date.now()}`,
        N_Days: inputs.Age * 365.25,
        Drug: 'Placebo',
        Ascites: 'N',
        Hepatomegaly: 'N',
        Spiders: 'N',
        Edema: 'N',
        Tryglicerides: 100
      };

      console.log('Saving simulation with data:', simulationData);

      const response = await axios.post(
        'http://localhost:5001/predict',
        simulationData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Save response:', response.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); 
    } catch (err) {
      console.error('Save error:', err);
      
      if (err.response) {
        const errorMessage = err.response.data?.error || 'Server error occurred';
        setError(`Save failed: ${errorMessage}`);
      } else if (err.request) {
        setError('No response from server. Please check if the prediction service is running.');
      } else {
        setError('Failed to save simulation. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetInputs = () => {
    setSelectedPreset('Healthy Adult');
    setInputs(presetProfiles['Healthy Adult']);
    setSaveSuccess(false);
  };

  const renderPredictionBadge = () => {
    if (!prediction) return null;
    
    const status = prediction.predicted_status || prediction.prediction;
    const riskLevel = prediction.risk_level || 
      (status === 'D' ? 'High' : 
       status === 'CL' ? 'Medium' : 'Low');
    
    return (
      <div className={`prediction-badge ${riskLevel.toLowerCase()}`}>
        {riskLevel === 'High' && '🔴 '}
        {riskLevel === 'Medium' && '🟡 '}
        {riskLevel === 'Low' && '🟢 '}
        Current Prediction: {riskLevel} Risk
      </div>
    );
  };

  const isValueOutOfRange = (feature, value) => {
    if (feature === 'Sex') return false;
    
    const metadata = featureMetadata[feature];
    if (!metadata || !metadata.normalRange) return false;
    
    const normalRange = metadata.normalRange;
    
    // Handle different range formats
    if (normalRange.includes('<')) {
      const maxValue = parseFloat(normalRange.split('<')[1]);
      return parseFloat(value) > maxValue;
    }
    
    if (normalRange.includes('-')) {
      const [min, max] = normalRange.split('-').map(v => parseFloat(v));
      return parseFloat(value) < min || parseFloat(value) > max;
    }
    
    return false;
  };

  const renderInputSuggestions = () => {
    const suggestions = generateInputSuggestions();
    
    return (
      <div className="input-suggestions">
        <h4>
          <Lightbulb size={16} />
          Clinical Insights
        </h4>
        <div className="suggestions-list">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-item">
                <div className={`suggestion-icon ${suggestion.type}`}></div>
                <div className="suggestion-text">
                  <span dangerouslySetInnerHTML={{
                    __html: suggestion.text.replace(
                      /([A-Z][a-z_]+)/g,
                      '<span class="parameter-name">$1</span>'
                    ).replace(
                      /(\d+\.?\d*\s*[a-zA-Z\/μ]+)/g,
                      '<span class="value-highlight">$1</span>'
                    )
                  }} />
                </div>
              </div>
            ))
          ) : (
            <div className="no-suggestions">
              <ThumbsUp size={20} />
              <p>All parameters look good! No specific clinical concerns identified.</p>
            </div>
          )}
        </div>
      </div>
    );
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
        <div className="playground-container">
          <div className="playground-header">
            <div className="header-content">
              <FlaskConical className="header-icon" />
              <div>
                <h1>Liver Disease Prediction Playground</h1>
                <p>Adjust clinical values to see how they affect liver disease risk predictions</p>
              </div>
            </div>
          </div>

          <div className="playground-controls">
            <div className="preset-selector">
              <label>Preset Profiles:</label>
              <div className="custom-select">
                <select 
                  value={selectedPreset} 
                  onChange={(e) => applyPreset(e.target.value)}
                >
                  {Object.keys(presetProfiles).map(preset => (
                    <option key={preset} value={preset}>{preset}</option>
                  ))}
                </select>
                <ChevronDown className="select-arrow" />
              </div>
              <button 
                className="btn-reset"
                onClick={resetInputs}
                disabled={loading}
              >
                <RefreshCw size={16} />
                Reset
              </button>
            </div>
          </div>

          <div className="playground-content">
            <div className="input-panel">
              <h3>
                <Activity size={20} />
                Clinical Parameters
              </h3>
              
              <div className="sliders-container">
                {Object.entries(inputs).map(([feature, value]) => (
                  <div key={feature} className="slider-group">
                    <div className="slider-header">
                      <label>
                        {feature.replace(/_/g, ' ')}
                        <div className="tooltip">
                          <Info size={14} />
                          <span className="tooltip-text">
                            <strong>{feature.replace(/_/g, ' ')}</strong>
                            <p>{tooltips[feature]}</p>
                            {featureMetadata[feature] && (
                              <p>Normal range: {featureMetadata[feature].normalRange} {featureMetadata[feature].unit}</p>
                            )}
                          </span>
                        </div>
                      </label>
                      <span className="slider-value">
                        {value} {featureMetadata[feature]?.unit || ''}
                      </span>
                    </div>
                    
                    {feature === 'Sex' ? (
                      <div className="sex-selector">
                        <label>
                          <input
                            type="radio"
                            name="sex"
                            value="M"
                            checked={value === 'M'}
                            onChange={() => handleInputChange('Sex', 'M')}
                          />
                          Male
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="sex"
                            value="F"
                            checked={value === 'F'}
                            onChange={() => handleInputChange('Sex', 'F')}
                          />
                          Female
                        </label>
                      </div>
                    ) : (
                      featureMetadata[feature] && (
                        <>
                          <input
                            type="range"
                            min={featureMetadata[feature].min}
                            max={featureMetadata[feature].max}
                            step={featureMetadata[feature].step}
                            value={value}
                            onChange={(e) => handleInputChange(feature, e.target.value)}
                            className="slider"
                          />
                          
                          <div className="slider-labels">
                            <span>{featureMetadata[feature].min}</span>
                            <span>{featureMetadata[feature].max}</span>
                          </div>
                        </>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="results-panel">
              <div className="prediction-card">
                <h3>
                  <FlaskConical size={20} />
                  AI Prediction
                </h3>
                
                <div className="prediction-result">
                  {loading ? (
                    <div className="loading-indicator">
                      <div className="spinner"></div>
                      <p>Analyzing inputs...</p>
                    </div>
                  ) : error ? (
                    <div className="prediction-error">
                      <AlertCircle className="error-icon" />
                      <p>{error}</p>
                    </div>
                  ) : prediction ? (
                    <div className="prediction-content">
                      {renderPredictionBadge()}
                      
                      {prediction.status_description && (
                        <p className="prediction-description">
                          {prediction.status_description}
                        </p>
                      )}
                      
                      {prediction.probabilities && (
                        <div className="probability-distribution">
                          <h4>Probability Distribution:</h4>
                          <div className="probability-bars">
                            {Object.entries(prediction.probabilities).map(([status, prob]) => (
                              <div key={status} className="probability-bar">
                                <div className="bar-label">
                                  <span>{status}</span>
                                  <span>{(prob * 100).toFixed(1)}%</span>
                                </div>
                                <div className="bar-container">
                                  <div 
                                    className="bar-fill" 
                                    style={{ width: `${prob * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="prediction-placeholder">
                      <p>Adjust the sliders to see prediction results</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="summary-card">
                <h3>Input Summary</h3>
                <div className="summary-table-container">
                  <table className="summary-table">
                    <thead>
                      <tr>
                        <th>Feature</th>
                        <th>Value</th>
                        <th>Normal Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(inputs).map(([feature, value]) => {
                        const metadata = featureMetadata[feature];
                        return (
                          <tr key={feature}>
                            <td>{feature.replace(/_/g, ' ')}</td>
                            <td>
                              {value} {metadata?.unit || ''}
                              {isValueOutOfRange(feature, value) && (
                                <span className="value-warning">⚠️</span>
                              )}
                            </td>
                            <td>{metadata?.normalRange || 'N/A'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Input Suggestions */}
                {renderInputSuggestions()}
              </div>
            </div>
          </div>

          <div className="action-bar">
            <button 
              className={`btn-save ${saveSuccess ? 'success' : ''}`}
              onClick={saveSimulation}
              disabled={!prediction || loading}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle size={16} />
                  Saved Successfully!
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Simulation
                </>
              )}
            </button>
            
            <div className="disclaimer">
              <Info size={16} />
              <p>
                This simulation tool is for educational purposes only. Actual clinical decisions should 
                always be made by qualified healthcare professionals based on comprehensive patient evaluation.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaygroundPage;