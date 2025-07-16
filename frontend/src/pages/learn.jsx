import React, { useState } from 'react';
import { useAuth } from '../auth';
import { Navigate } from 'react-router-dom';
import { 
  BookOpen, 
  Image, 
  Brain, 
  ArrowRight, 
  Activity, 
  Droplets, 
  Shield, 
  Loader, 
  Heart, 
  Zap, 
  TrendingUp, 
  Clock, 
  Pill, 
  User, 
  Calendar,
  Filter,
  Grid,
  List
} from 'lucide-react';
import '../styles/LearningPage.css';
import Sidebar from '../components/sidebar';

const LearningPage = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('features');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Feature navigation states
  const [selectedFeatureCategory, setSelectedFeatureCategory] = useState('all');
  const [featureViewMode, setFeatureViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Visual aids navigation states
  const [selectedVisualCategory, setSelectedVisualCategory] = useState('all');
  const [visualViewMode, setVisualViewMode] = useState('grid');
  
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

  // Categorized medical features
  const medicalFeatures = [
    // Liver Function Tests
    {
      name: "Bilirubin",
      category: "liver_function",
      icon: <Droplets className="feature-icon" />,
      simpleExplanation: "Bilirubin is a yellow substance that your body makes when it breaks down old red blood cells.",
      whatItIs: "When red blood cells die naturally, your liver processes them and creates bilirubin. A healthy liver removes this bilirubin from your blood.",
      normalRange: "0.2 - 1.2 mg/dL",
      highMeans: "High bilirubin means your liver isn't removing this waste properly, causing yellowing of skin and eyes (jaundice).",
      lowMeans: "Low bilirubin is usually not a concern and can be normal.",
      liverEffect: "When the liver is damaged, it can't process bilirubin efficiently, causing it to build up in the blood and tissues."
    },
    {
      name: "ALT/SGOT (Liver Enzymes)",
      category: "liver_function",
      icon: <Activity className="feature-icon" />,
      simpleExplanation: "ALT and SGOT are enzymes that normally live inside liver cells and help the liver function.",
      whatItIs: "These enzymes help the liver process nutrients and remove toxins. They should stay inside healthy liver cells.",
      normalRange: "ALT: 7-56 U/L, SGOT: 10-40 U/L",
      highMeans: "High levels mean liver cells are damaged or dying, releasing these enzymes into the blood.",
      lowMeans: "Low levels are generally normal and not concerning.",
      liverEffect: "Damaged liver cells leak these enzymes into the bloodstream, making them important markers of liver injury."
    },
    {
      name: "Albumin",
      category: "liver_function",
      icon: <Shield className="feature-icon" />,
      simpleExplanation: "Albumin is the most important protein made by your liver that transports substances through your blood.",
      whatItIs: "Albumin carries hormones, vitamins, and drugs through your bloodstream and helps maintain fluid balance.",
      normalRange: "3.4 - 5.4 g/dL",
      highMeans: "High albumin is rare but can happen with dehydration.",
      lowMeans: "Low albumin means your liver isn't making enough protein, causing swelling in legs and belly.",
      liverEffect: "A damaged liver can't produce enough albumin, leading to fluid retention and swelling (edema)."
    },
    {
      name: "Alkaline Phosphatase (Alk_Phos)",
      category: "liver_function",
      icon: <Activity className="feature-icon" />,
      simpleExplanation: "Alkaline phosphatase is an enzyme found in liver cells and bile ducts that drain digestive fluids.",
      whatItIs: "This enzyme helps move substances across cell membranes, especially in bile ducts.",
      normalRange: "44 - 147 U/L",
      highMeans: "High levels usually mean the bile ducts are blocked or damaged.",
      lowMeans: "Low levels are generally not concerning.",
      liverEffect: "When bile ducts are blocked, this enzyme builds up in the blood, indicating drainage problems."
    },
    
    // Blood Tests
    {
      name: "Platelets",
      category: "blood_tests",
      icon: <Droplets className="feature-icon" />,
      simpleExplanation: "Platelets are tiny blood cells that help your blood clot when you get injured.",
      whatItIs: "Platelets rush to injury sites and stick together to form plugs, stopping bleeding.",
      normalRange: "150,000 - 450,000 per μL",
      highMeans: "High platelets can increase clotting risk but are less common in liver disease.",
      lowMeans: "Low platelets mean higher bleeding risk and easy bruising.",
      liverEffect: "In liver disease, the spleen enlarges and traps platelets, reducing available circulation."
    },
    {
      name: "Prothrombin Time",
      category: "blood_tests",
      icon: <Clock className="feature-icon" />,
      simpleExplanation: "Prothrombin time measures how quickly your blood can form a clot.",
      whatItIs: "Your liver makes clotting proteins. This test measures how well these proteins work together.",
      normalRange: "11 - 13 seconds",
      highMeans: "Longer time means your blood takes too long to clot, increasing bleeding risk.",
      lowMeans: "Shorter time might mean increased clotting risk (less common).",
      liverEffect: "A damaged liver can't make enough clotting proteins, so blood takes longer to clot."
    },
    {
      name: "Cholesterol",
      category: "blood_tests",
      icon: <TrendingUp className="feature-icon" />,
      simpleExplanation: "Cholesterol is a waxy substance that your liver produces and regulates.",
      whatItIs: "Your liver makes most cholesterol and controls levels. It's needed for cell membranes and hormones.",
      normalRange: "Less than 200 mg/dL (total cholesterol)",
      highMeans: "High cholesterol increases heart disease risk, but may be low in liver disease.",
      lowMeans: "Very low cholesterol can indicate severe liver disease.",
      liverEffect: "A damaged liver may not produce enough cholesterol or regulate levels properly."
    },
    {
      name: "Copper",
      category: "blood_tests",
      icon: <Droplets className="feature-icon" />,
      simpleExplanation: "Copper is a metal your body needs in small amounts, but liver must remove excess copper.",
      whatItIs: "Your liver removes extra copper through bile. Copper is needed for red blood cells and nerves.",
      normalRange: "70 - 140 μg/dL",
      highMeans: "High copper levels can indicate Wilson's disease or liver problems with copper accumulation.",
      lowMeans: "Low copper is less common but can occur with malnutrition.",
      liverEffect: "When liver can't remove copper properly, it builds up causing damage and Wilson's disease."
    },
    {
      name: "Triglycerides",
      category: "blood_tests",
      icon: <Activity className="feature-icon" />,
      simpleExplanation: "Triglycerides are a type of fat in your blood that your liver helps manage.",
      whatItIs: "Your liver processes fats from food and makes triglycerides for energy storage.",
      normalRange: "Less than 150 mg/dL",
      highMeans: "High triglycerides can indicate fatty liver disease, diabetes, or heart disease risk.",
      lowMeans: "Low triglycerides are generally not concerning.",
      liverEffect: "Liver disease affects fat metabolism, leading to abnormal triglyceride levels."
    },
    
    // Physical Examination
    {
      name: "Ascites",
      category: "physical_exam",
      icon: <Droplets className="feature-icon" />,
      simpleExplanation: "Ascites is fluid buildup in the belly area, like a balloon slowly filling with water.",
      whatItIs: "When liver function is poor, fluid leaks into the belly cavity due to low albumin and high vessel pressure.",
      normalRange: "None (no fluid should accumulate)",
      highMeans: "Presence of ascites indicates advanced liver disease requiring medical attention.",
      lowMeans: "No ascites is normal and healthy.",
      liverEffect: "Ascites signals severely compromised liver function and inability to maintain fluid balance."
    },
    {
      name: "Edema",
      category: "physical_exam",
      icon: <Shield className="feature-icon" />,
      simpleExplanation: "Edema is swelling caused by excess fluid trapped in body tissues.",
      whatItIs: "When liver doesn't make enough albumin, fluid leaks from blood vessels into tissues.",
      normalRange: "None (no swelling)",
      highMeans: "Swelling indicates fluid retention, often related to liver, heart, or kidney problems.",
      lowMeans: "No swelling is normal.",
      liverEffect: "Reduced albumin production leads to fluid retention, especially in lower body due to gravity."
    },
    {
      name: "Hepatomegaly",
      category: "physical_exam",
      icon: <Heart className="feature-icon" />,
      simpleExplanation: "Hepatomegaly means an enlarged liver, growing bigger than its normal size.",
      whatItIs: "A healthy liver has a specific size. When enlarged, it can be felt below the right rib cage.",
      normalRange: "Normal sized liver (not palpable below ribs)",
      highMeans: "An enlarged liver can indicate inflammation, infection, fat accumulation, or other diseases.",
      lowMeans: "Normal liver size is healthy.",
      liverEffect: "Liver enlargement occurs as the liver tries to compensate for damage or inflammation."
    },
    {
      name: "Spider Angiomata (Spiders)",
      category: "physical_exam",
      icon: <Zap className="feature-icon" />,
      simpleExplanation: "Spider angiomata are small, spider-like blood vessels visible on the skin.",
      whatItIs: "These are dilated blood vessels appearing on face, neck, chest, or arms due to hormonal changes.",
      normalRange: "None or very few (1-2 small ones can be normal)",
      highMeans: "Multiple spider angiomata can indicate liver disease due to improper hormone processing.",
      lowMeans: "Few or no spider angiomata is normal.",
      liverEffect: "Damaged liver can't break down estrogen properly, causing hormone imbalances and spider vessels."
    },
    
    // Patient Demographics
    {
      name: "Age",
      category: "demographics",
      icon: <Calendar className="feature-icon" />,
      simpleExplanation: "Age affects liver disease risk and progression patterns.",
      whatItIs: "Patient's age influences liver disease development, progression, and treatment outcomes.",
      normalRange: "Varies by condition",
      highMeans: "Older patients may have higher risk of complications and slower recovery.",
      lowMeans: "Younger patients often have better healing capacity but different disease patterns.",
      liverEffect: "Age affects liver regeneration, immune response, and ability to process toxins."
    },
    {
      name: "Sex",
      category: "demographics",
      icon: <User className="feature-icon" />,
      simpleExplanation: "Sex affects liver disease risk and presentation patterns.",
      whatItIs: "Patient's biological sex influences hormone levels, drug metabolism, and disease susceptibility.",
      normalRange: "Male or Female",
      highMeans: "Different sexes may have varying risks for certain liver conditions.",
      lowMeans: "Both sexes can develop liver disease, but patterns may differ.",
      liverEffect: "Sex influences liver enzyme levels and susceptibility to diseases due to hormonal differences."
    },
    
    // Treatment & Monitoring
    {
      name: "Drug Treatment",
      category: "treatment",
      icon: <Pill className="feature-icon" />,
      simpleExplanation: "Drug refers to the medication or treatment for the liver condition.",
      whatItIs: "The specific medication or treatment protocol used to manage liver disease.",
      normalRange: "Varies by medication",
      highMeans: "Different drugs have different effects and side effect profiles.",
      lowMeans: "Treatment choice depends on disease stage and patient factors.",
      liverEffect: "Different medications work through various mechanisms to slow disease progression."
    },
    {
      name: "N_Days",
      category: "treatment",
      icon: <Clock className="feature-icon" />,
      simpleExplanation: "N_Days represents the number of days in the study or treatment period.",
      whatItIs: "The duration of observation or treatment, measured from study or treatment start.",
      normalRange: "Varies by study design",
      highMeans: "Longer follow-up periods provide more information about disease progression.",
      lowMeans: "Shorter periods may not capture long-term effects.",
      liverEffect: "Time is crucial for monitoring progression, treatment response, and outcomes."
    },
    {
      name: "Stage",
      category: "treatment",
      icon: <TrendingUp className="feature-icon" />,
      simpleExplanation: "Stage indicates how advanced the liver disease is.",
      whatItIs: "A classification describing disease severity and progression from early to advanced stages.",
      normalRange: "Stage 1 (early) to Stage 4 (advanced)",
      highMeans: "Higher stages indicate more advanced disease with greater complications.",
      lowMeans: "Lower stages suggest earlier disease with better prognosis.",
      liverEffect: "Disease stage reflects extent of liver damage and guides treatment decisions."
    }
  ];

  // Categorized visual aids
  const visualAids = [
    // Clinical Signs
    {
      title: "Normal vs. Jaundiced Eyes",
      category: "clinical_signs",
      description: "High bilirubin levels can cause yellowing of the eyes and skin (jaundice), a visible sign of liver problems.",
      placeholder: "Image showing normal white eyes vs. yellow-tinted eyes"
    },
    {
      title: "Edema in Lower Extremities",
      category: "clinical_signs",
      description: "Swelling in legs and ankles is common when the liver can't produce enough albumin protein.",
      placeholder: "Images showing normal ankles vs. swollen ankles with edema"
    },
    {
      title: "Spider Angiomata",
      category: "clinical_signs",
      description: "Examples of spider-like blood vessels that appear on skin in liver disease.",
      placeholder: "Images showing spider angiomata on face, neck, and chest"
    },
    
    // Anatomy & Structure
    {
      title: "Liver Anatomy",
      category: "anatomy",
      description: "Understanding the liver's structure helps explain how different tests measure liver function.",
      placeholder: "Diagram of liver anatomy showing bile ducts, blood vessels, and liver cells"
    },
    {
      title: "Hepatomegaly Comparison",
      category: "anatomy",
      description: "Visual comparison between normal liver size and enlarged liver (hepatomegaly).",
      placeholder: "Anatomical diagram showing normal vs. enlarged liver"
    },
    
    // Disease Progression
    {
      title: "Ascites Progression",
      category: "disease_progression",
      description: "Visual comparison showing how fluid buildup in the abdomen progresses in liver disease.",
      placeholder: "Images showing normal abdomen vs. abdomen with ascites (fluid buildup)"
    },
    {
      title: "Liver Disease Stages",
      category: "disease_progression",
      description: "Visual representation of how liver disease progresses from compensation to decompensation.",
      placeholder: "Flowchart showing progression: Normal → Compensated → Decompensated liver disease"
    },
    
    // Laboratory Concepts
    {
      title: "Blood Clotting Process",
      category: "lab_concepts",
      description: "How the liver produces proteins essential for blood clotting and what happens when it can't.",
      placeholder: "Diagram showing normal blood clotting vs. delayed clotting in liver disease"
    },
    {
      title: "Copper Accumulation",
      category: "lab_concepts",
      description: "How copper builds up in liver tissue when the liver can't remove it properly.",
      placeholder: "Microscopic images showing normal liver vs. copper accumulation"
    },
    {
      title: "Cholesterol Metabolism",
      category: "lab_concepts",
      description: "How the liver processes cholesterol and what happens when this process is disrupted.",
      placeholder: "Diagram showing normal cholesterol processing vs. liver disease effects"
    },
    {
      title: "Triglyceride Processing",
      category: "lab_concepts",
      description: "How the liver manages fat metabolism and what happens in liver disease.",
      placeholder: "Diagram showing normal fat processing vs. fatty liver disease"
    },
    
    // Patient Factors
    {
      title: "Age-Related Liver Changes",
      category: "patient_factors",
      description: "How liver function and disease risk change with age.",
      placeholder: "Chart showing liver function across different age groups"
    },
    {
      title: "Gender Differences in Liver Disease",
      category: "patient_factors",
      description: "How liver disease affects men and women differently.",
      placeholder: "Comparison chart showing disease patterns by gender"
    },
    {
      title: "Drug Treatment Effects",
      category: "patient_factors",
      description: "How different medications work to treat liver disease.",
      placeholder: "Diagram showing drug mechanisms and effects on liver"
    }
  ];

  // Feature categories
  const featureCategories = [
    { id: 'all', label: 'All Features', count: medicalFeatures.length },
    { id: 'liver_function', label: 'Liver Function Tests', count: medicalFeatures.filter(f => f.category === 'liver_function').length },
    { id: 'blood_tests', label: 'Blood Tests', count: medicalFeatures.filter(f => f.category === 'blood_tests').length },
    { id: 'physical_exam', label: 'Physical Examination', count: medicalFeatures.filter(f => f.category === 'physical_exam').length },
    { id: 'demographics', label: 'Patient Demographics', count: medicalFeatures.filter(f => f.category === 'demographics').length },
    { id: 'treatment', label: 'Treatment & Monitoring', count: medicalFeatures.filter(f => f.category === 'treatment').length }
  ];

  // Visual categories
  const visualCategories = [
    { id: 'all', label: 'All Visual Aids', count: visualAids.length },
    { id: 'clinical_signs', label: 'Clinical Signs', count: visualAids.filter(v => v.category === 'clinical_signs').length },
    { id: 'anatomy', label: 'Anatomy & Structure', count: visualAids.filter(v => v.category === 'anatomy').length },
    { id: 'disease_progression', label: 'Disease Progression', count: visualAids.filter(v => v.category === 'disease_progression').length },
    { id: 'lab_concepts', label: 'Laboratory Concepts', count: visualAids.filter(v => v.category === 'lab_concepts').length },
    { id: 'patient_factors', label: 'Patient Factors', count: visualAids.filter(v => v.category === 'patient_factors').length }
  ];

  const aiSteps = [
    {
      step: 1,
      title: "Data Input",
      description: "You enter patient information including lab values, physical exam findings, and demographic data into the system.",
      icon: <BookOpen className="step-icon" />
    },
    {
      step: 2,
      title: "Data Processing",
      description: "The AI preprocesses your input, checking for missing values and converting everything to a format the model can understand.",
      icon: <Activity className="step-icon" />
    },
    {
      step: 3,
      title: "Pattern Recognition",
      description: "The trained model compares your input to patterns learned from thousands of previous liver disease cases in medical databases.",
      icon: <Brain className="step-icon" />
    },
    {
      step: 4,
      title: "Risk Calculation",
      description: "Based on the patterns, the AI calculates the probability of different liver disease stages: Compensated (C), Controlled (CL), or Decompensated (D).",
      icon: <Shield className="step-icon" />
    },
    {
      step: 5,
      title: "Result Output",
      description: "The system provides a prediction with confidence levels and risk assessment, along with a disclaimer that this is not a medical diagnosis.",
      icon: <ArrowRight className="step-icon" />
    }
  ];

  // Filter functions
  const getFilteredFeatures = () => {
    if (selectedFeatureCategory === 'all') {
      return medicalFeatures;
    }
    return medicalFeatures.filter(feature => feature.category === selectedFeatureCategory);
  };

  const getFilteredVisualAids = () => {
    if (selectedVisualCategory === 'all') {
      return visualAids;
    }
    return visualAids.filter(aid => aid.category === selectedVisualCategory);
  };

  const renderFeatureNavigation = () => (
    <div className="navigation-container">
      <div className="nav-header">
        <h3><Filter className="nav-icon" /> Filter by Category</h3>
        <div className="view-toggle">
          <button 
            className={`view-btn ${featureViewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setFeatureViewMode('grid')}
          >
            <Grid size={16} />
          </button>
          <button 
            className={`view-btn ${featureViewMode === 'list' ? 'active' : ''}`}
            onClick={() => setFeatureViewMode('list')}
          >
            <List size={16} />
          </button>
        </div>
      </div>
      <div className="category-filters">
        {featureCategories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedFeatureCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedFeatureCategory(category.id)}
          >
            {category.label}
            <span className="count">({category.count})</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderVisualNavigation = () => (
    <div className="navigation-container">
      <div className="nav-header">
        <h3><Filter className="nav-icon" /> Filter by Category</h3>
        <div className="view-toggle">
          <button 
            className={`view-btn ${visualViewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setVisualViewMode('grid')}
          >
            <Grid size={16} />
          </button>
          <button 
            className={`view-btn ${visualViewMode === 'list' ? 'active' : ''}`}
            onClick={() => setVisualViewMode('list')}
          >
            <List size={16} />
          </button>
        </div>
      </div>
      <div className="category-filters">
        {visualCategories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedVisualCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedVisualCategory(category.id)}
          >
            {category.label}
            <span className="count">({category.count})</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderFeatureExplanations = () => {
    const filteredFeatures = getFilteredFeatures();
    
    return (
      <div className="features-container">
        <div className="features-intro">
          <h2>Understanding Medical Features</h2>
          <p>Learn about the key medical measurements that help doctors assess liver health. Each feature tells us something important about how well the liver is working.</p>
          <div className="feature-count">
            <strong>Showing {filteredFeatures.length} of {medicalFeatures.length} features</strong>
          </div>
        </div>
        
        {renderFeatureNavigation()}
        
        <div className={`features-display ${featureViewMode}`}>
          {filteredFeatures.map((feature, index) => (
            <div key={`feature-${feature.category}-${index}`} className="feature-card">
              <div className="feature-header">
                {feature.icon}
                <h3>{feature.name}</h3>
                <span className="category-badge">{featureCategories.find(c => c.id === feature.category)?.label}</span>
              </div>
              <div className="feature-content">
                <div className="feature-section">
                  <h4>What is it?</h4>
                  <p>{feature.simpleExplanation}</p>
                  <p>{feature.whatItIs}</p>
                </div>
                <div className="feature-section">
                  <h4>Normal Range</h4>
                  <p className="normal-range">{feature.normalRange}</p>
                </div>
                <div className="feature-section">
                  <h4>What if it's high?</h4>
                  <p>{feature.highMeans}</p>
                </div>
                <div className="feature-section">
                  <h4>What if it's low?</h4>
                  <p>{feature.lowMeans}</p>
                </div>
                <div className="feature-section liver-effect">
                  <h4>How it affects the liver</h4>
                  <p>{feature.liverEffect}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVisualAids = () => {
    const filteredVisualAids = getFilteredVisualAids();
    
    return (
      <div className="visual-aids-container">
        <div className="visual-intro">
          <h2>Visual Learning Aids</h2>
          <p>Sometimes seeing is understanding. These visual aids help explain the medical concepts in a more intuitive way.</p>
          <div className="visual-count">
            <strong>Showing {filteredVisualAids.length} of {visualAids.length} visual aids</strong>
          </div>
        </div>
        
        {renderVisualNavigation()}
        
        <div className={`images-display ${visualViewMode}`}>
          {filteredVisualAids.map((aid, index) => (
            <div key={`visual-${aid.category}-${index}`} className="image-card">
              <div className="image-placeholder">
                <Image className="placeholder-icon" />
                <span>Image Placeholder</span>
              </div>
              <div className="image-info">
                <h3>{aid.title}</h3>
                <span className="category-badge">{visualCategories.find(c => c.id === aid.category)?.label}</span>
                <p>{aid.description}</p>
                <small className="placeholder-text">{aid.placeholder}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHowAIWorks = () => (
    <div className="ai-explanation-container">
      <div className="ai-intro">
        <h2>How LiverLens AI Works</h2>
        <p>Understanding the magic behind the prediction - a step-by-step journey from your input to AI prediction.</p>
      </div>
      
      <div className="ai-overview">
        <div className="ai-overview-card">
          <Brain className="ai-brain-icon" />
          <h3>Machine Learning Simplified</h3>
          <p>Our AI model was trained on thousands of real patient cases from medical databases. It learned to recognize patterns between lab values, symptoms, and liver disease outcomes. Think of it like a very experienced doctor who has seen thousands of similar cases and can spot patterns humans might miss.</p>
        </div>
      </div>

      <div className="ai-steps">
        <h3>The Prediction Process</h3>
        <div className="steps-container">
          {aiSteps.map((step, index) => (
            <div key={`step-${index}`} className="step-card">
              <div className="step-number">{step.step}</div>
              <div className="step-content">
                {step.icon}
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
              {index < aiSteps.length - 1 && <ArrowRight className="step-arrow" />}
            </div>
          ))}
        </div>
      </div>

      <div className="ai-flowchart">
        <h3>Visual Flow</h3>
        <div className="flowchart">
          <div className="flow-step input">
            <BookOpen />
            <span>Patient Data</span>
          </div>
          <ArrowRight className="flow-arrow" />
          <div className="flow-step process">
            <Activity />
            <span>AI Processing</span>
          </div>
          <ArrowRight className="flow-arrow" />
          <div className="flow-step output">
            <Shield />
            <span>Risk Prediction</span>
          </div>
        </div>
      </div>

      <div className="ai-limitations">
        <h3>Important Limitations</h3>
        <div className="limitations-card">
          <Shield className="warning-icon" />
          <div>
            <h4>Not a Medical Diagnosis</h4>
            <p>This AI tool is designed for educational purposes and to assist healthcare professionals. It should never replace proper medical consultation, diagnosis, or treatment by qualified healthcare providers.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'features':
        return renderFeatureExplanations();
      case 'visual':
        return renderVisualAids();
      case 'ai':
        return renderHowAIWorks();
      default:
        return renderFeatureExplanations();
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
        <div className="learning-page">
          <div className="learning-header">
            <h1>Welcome to LiverLens Learning Center, {user.full_name}!</h1>
            <p>Expand your knowledge about liver health, medical features, and AI-powered predictions</p>
          </div>

          <div className="tabs-container">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => setActiveTab('features')}
              >
                <BookOpen />
                Feature Explanations
                <span className="tab-count">({medicalFeatures.length})</span>
              </button>
              <button 
                className={`tab ${activeTab === 'visual' ? 'active' : ''}`}
                onClick={() => setActiveTab('visual')}
              >
                <Image />
                Visual Aids
                <span className="tab-count">({visualAids.length})</span>
              </button>
              <button 
                className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai')}
              >
                <Brain />
                How AI Works
              </button>
            </div>
          </div>

          <div className="tab-content">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearningPage;