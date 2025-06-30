# cirrhosis_prediction_app.py
import joblib
import pandas as pd
import numpy as np

# Load the trained model and preprocessing components
MODEL_PATH = 'final_xgb_model.pkl'
PREPROCESSING_PATH = 'preprocessing_components.pkl'

try:
    model = joblib.load(MODEL_PATH)
    components = joblib.load(PREPROCESSING_PATH)
    print("✅ Model and preprocessing components loaded successfully!")
except FileNotFoundError:
    print("❌ Error: Model files not found. Please ensure:")
    print(f"- {MODEL_PATH} and {PREPROCESSING_PATH} exist in the current directory")
    print("- You've run the full training pipeline first")
    exit()

# Clinical feature descriptions for user guidance
FEATURE_DESCRIPTIONS = {
    'N_Days': 'Number of days of follow-up',
    'Drug': 'Drug type (D-penicillamine or Placebo)',
    'Age': 'Patient age in years',
    'Sex': 'Gender (M: Male, F: Female)',
    'Ascites': 'Ascites present (Yes/No)',
    'Hepatomegaly': 'Hepatomegaly present (Yes/No)',
    'Spiders': 'Spider angiomas (Yes/No)',
    'Edema': 'Edema status (0: no edema, 0.5: edema without diuretics, 1: edema despite diuretics)',
    'Bilirubin': 'Serum bilirubin (mg/dL)',
    'Cholesterol': 'Serum cholesterol (mg/dL)',
    'Albumin': 'Serum albumin (g/dL)',
    'Copper': 'Urine copper (μg/day)',
    'Alk_Phos': 'Alkaline phosphatase (U/L)',  
    'SGOT': 'Serum glutamic-oxaloacetic transaminase (U/mL)',
    'Tryglicerides': 'Triglycerides (mg/dL)',
    'Platelets': 'Platelet count per cubic mm/1000',
    'Prothrombin': 'Prothrombin time (seconds)',
    'Stage': 'Histologic stage of disease (1-4)'
}

# Get all expected features from the model
EXPECTED_FEATURES = components['feature_names']
print(f"🔍 Model expects {len(EXPECTED_FEATURES)} features")

def get_user_input():
    """Collect user input for each clinical feature"""
    patient_data = {}
    
    print("\n" + "="*50)
    print("CIRRHOSIS STATUS PREDICTION TOOL")
    print("="*50)
    print("Please enter patient's clinical information:")
    print("(Press Enter to use default median values for numeric features)")
    print("="*50)
    
    # Collect all expected features
    for feature in EXPECTED_FEATURES:
        description = FEATURE_DESCRIPTIONS.get(feature, feature)
        
        # Handle special case for Alk_Phos
        if feature == 'Alk_Phos':
            prompt_name = 'Alk_Phos'
        else:
            prompt_name = feature
            
        # Get encoder if available
        encoder = components['categorical_encoders'].get(feature) if 'categorical_encoders' in components else None
        
        if encoder:
            # Categorical feature
            valid_options = list(encoder.classes_)
            formatted_options = ", ".join(valid_options)
            
            while True:
                value = input(f"{prompt_name} ({description}) [{formatted_options}]: ").strip()
                if value in valid_options:
                    break
                print(f"Invalid option. Please choose from: {formatted_options}")
            
            patient_data[feature] = value
        else:
            # Numeric feature
            # Find default value if available
            default_value = None
            if 'imputation_values' in components and feature in components['imputation_values']:
                default_value = components['imputation_values'][feature]
            
            while True:
                value_input = input(f"{prompt_name} ({description}): ")
                if not value_input.strip() and default_value is not None:
                    value = default_value
                    print(f"Using default value: {value:.2f}")
                    break
                try:
                    value = float(value_input)
                    break
                except ValueError:
                    print("Invalid input. Please enter a numeric value.")
            patient_data[feature] = value
    
    return patient_data

def preprocess_input(input_data, components):
    """Preprocess user input to match model requirements"""
    # Create DataFrame
    input_df = pd.DataFrame([input_data])
    
    # Encode categorical features
    if 'categorical_encoders' in components:
        for feature, encoder in components['categorical_encoders'].items():
            if feature in input_df.columns:
                input_df[feature] = encoder.transform(input_df[feature])
    
    # Ensure correct feature order
    input_df = input_df[EXPECTED_FEATURES]
    
    return input_df

def interpret_prediction(probabilities):
    """Convert model probabilities to human-readable results"""
    class_mapping = {0: 'Compensated (C)', 1: 'Controlled (CL)', 2: 'Decompensated (D)'}
    class_probs = {
        class_mapping[i]: prob 
        for i, prob in enumerate(probabilities[0])
    }
    
    # Get predicted class
    predicted_class_idx = np.argmax(probabilities)
    predicted_class = class_mapping[predicted_class_idx]
    confidence = probabilities[0][predicted_class_idx] * 100
    
    # Interpretation guide
    interpretations = {
        'Compensated (C)': "Early stage with no symptoms. Liver compensates for damage.",
        'Controlled (CL)': "Disease controlled with treatment. Moderate liver damage.",
        'Decompensated (D)': "Advanced stage with complications. Significant liver dysfunction."
    }
    
    # Risk assessment
    risk_level = {
        'Compensated (C)': 'Low',
        'Controlled (CL)': 'Moderate',
        'Decompensated (D)': 'High'
    }
    
    return {
        'predicted_class': predicted_class,
        'confidence': confidence,
        'probabilities': class_probs,
        'interpretation': interpretations[predicted_class],
        'risk_level': risk_level[predicted_class]
    }

def display_results(results):
    """Display prediction results in a user-friendly format"""
    print("\n" + "="*50)
    print("PREDICTION RESULTS")
    print("="*50)
    print(f"Predicted Status: {results['predicted_class']}")
    print(f"Confidence: {results['confidence']:.1f}%")
    print(f"Risk Level: {results['risk_level']}")
    
    print("\nProbability Breakdown:")
    for status, prob in results['probabilities'].items():
        print(f"- {status}: {prob*100:.1f}%")
    
    print("\nClinical Interpretation:")
    print(results['interpretation'])
    
    print("\n" + "="*50)
    print("CLINICAL RECOMMENDATIONS")
    print("="*50)
    
    recommendations = {
        'Compensated (C)': [
            "Regular monitoring (every 6 months)",
            "Lifestyle modifications: alcohol cessation, healthy diet",
            "Vaccination against hepatitis A and B if not immune",
            "Consider non-invasive fibrosis assessment"
        ],
        'Controlled (CL)': [
            "Enhanced monitoring (every 3 months)",
            "Continue prescribed medications",
            "Nutritional assessment and support",
            "Screen for varices and HCC surveillance",
            "Evaluate for liver transplantation referral"
        ],
        'Decompensated (D)': [
            "Urgent hepatology consultation",
            "Hospitalization if signs of decompensation",
            "Manage complications: ascites, encephalopathy, bleeding",
            "Prioritize for liver transplantation evaluation",
            "Palliative care consultation if appropriate"
        ]
    }
    
    for rec in recommendations[results['predicted_class']]:
        print(f"- {rec}")

def main():
    """Main application flow"""
    # Get user input
    user_data = get_user_input()
    
    # Preprocess input
    try:
        processed_data = preprocess_input(user_data, components)
    except Exception as e:
        print(f"❌ Error during preprocessing: {str(e)}")
        print("Please check your input values and try again.")
        return
    
    # Make prediction
    probabilities = model.predict_proba(processed_data)
    
    # Interpret results
    results = interpret_prediction(probabilities)
    
    # Display results
    display_results(results)

if __name__ == "__main__":
    main()