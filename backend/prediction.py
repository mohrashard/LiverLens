# prediction.py
import os
import logging
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
from dotenv import load_dotenv
from functools import wraps
import warnings
warnings.filterwarnings('ignore')

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'default-secret-key')

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client["liverlens_db"]
users_collection = db["users"]
predictions_collection = db["predictions"]

model = None
preprocessing_components = None

def load_model_and_components():
    global model, preprocessing_components
    try:
        model_path = os.path.join(os.getcwd(), 'final_xgb_model.pkl')
        model = joblib.load(model_path)
        logger.info("XGBoost model loaded successfully")
        preprocessing_path = os.path.join(os.getcwd(), 'preprocessing_components.pkl')
        preprocessing_components = joblib.load(preprocessing_path)
        logger.info("Preprocessing components loaded successfully")
        logger.info(f"Model type: {type(model).__name__}")
        logger.info(f"Feature names: {len(preprocessing_components['feature_names'])}")
    except FileNotFoundError as e:
        logger.error(f"Model files not found: {e}")
        raise
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise

load_model_and_components()

@app.after_request
def add_cors_headers(response):
    allowed_origin = os.getenv('CORS_ALLOWED_ORIGIN', 'http://localhost:3000')
    response.headers['Access-Control-Allow-Origin'] = allowed_origin
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@app.route('/predict', methods=['OPTIONS'])
@app.route('/predict-only', methods=['OPTIONS'])
@app.route('/history', methods=['OPTIONS'])
@app.route('/history/<prediction_id>', methods=['OPTIONS'])
@app.route('/stats', methods=['OPTIONS'])
def options_handler(prediction_id=None): 
    return '', 200

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def validate_input_data(data):
    required_fields = [
        'Patient_Name', 'Patient_ID',
        'N_Days', 'Drug', 'Age', 'Sex', 'Ascites', 'Hepatomegaly', 
        'Spiders', 'Edema', 'Bilirubin', 'Cholesterol', 'Albumin', 
        'Copper', 'Alk_Phos', 'SGOT', 'Tryglicerides', 'Platelets', 
        'Prothrombin', 'Stage'
    ]
    
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    if not data['Patient_Name']:
        return False, "Patient Name is required"
    if not data['Patient_ID']:
        return False, "Patient ID is required"
    
    try:
        age = float(data['Age']) if data['Age'] not in [None, '', 'null'] else None
        if age is not None and (age <= 0 or age > 150):
            return False, "Age must be between 0 and 150 years"
    except (ValueError, TypeError):
        return False, "Age must be a valid number"
    
    if data['Sex'] not in [None, '', 'null']:
        if str(data['Sex']).upper() not in ['M', 'F', 'MALE', 'FEMALE']:
            return False, "Sex must be 'M', 'F', 'Male', or 'Female'"
    
    try:
        stage = float(data['Stage']) if data['Stage'] not in [None, '', 'null'] else None
        if stage is not None and (stage < 1 or stage > 4):
            return False, "Stage must be between 1 and 4"
    except (ValueError, TypeError):
        return False, "Stage must be a valid number"
    
    return True, "Valid input data"

def preprocess_input(data):
    try:
        # Create a copy to avoid modifying original data
        processed_data = data.copy()
        
        # Handle missing values
        for key in processed_data:
            if processed_data[key] in [None, '', 'null']:
                processed_data[key] = np.nan
        
        # Convert numerical features
        numerical_features = [
            'N_Days', 'Age', 'Bilirubin', 'Cholesterol', 'Albumin', 'Copper',
            'Alk_Phos', 'SGOT', 'Tryglicerides', 'Platelets', 'Prothrombin', 'Stage'
        ]
        
        for feature in numerical_features:
            if feature in processed_data:
                try:
                    processed_data[feature] = float(processed_data[feature])
                except (ValueError, TypeError):
                    processed_data[feature] = np.nan
        
        # Convert categorical features
        categorical_features = ['Drug', 'Sex', 'Ascites', 'Hepatomegaly', 'Spiders', 'Edema']
        for feature in categorical_features:
            if feature in processed_data and processed_data[feature] not in [None, '', 'null']:
                processed_data[feature] = str(processed_data[feature]).upper()[0]
            else:
                processed_data[feature] = 'N'  # Default to 'No'
        
        # Create DataFrame
        df = pd.DataFrame([processed_data])
        
        # Apply imputation
        imputer = preprocessing_components['imputer']
        df[numerical_features] = imputer.transform(df[numerical_features])
        
        # Apply categorical encoding
        categorical_encoders = preprocessing_components.get('categorical_encoders', {})
        for feature in categorical_features:
            if feature in categorical_encoders and feature in df.columns:
                encoder = categorical_encoders[feature]
                try:
                    df[feature] = encoder.transform(df[feature].astype(str))
                except ValueError:
                    # Handle unknown categories
                    df[feature] = encoder.transform([encoder.classes_[0]])[0]
        
        # Ensure all features are present
        feature_names = preprocessing_components['feature_names']
        for feature in feature_names:
            if feature not in df.columns:
                df[feature] = 0
        
        df = df[feature_names]
        logger.info(f"Preprocessed data shape: {df.shape}")
        return df
    except Exception as e:
        logger.error(f"Preprocessing error: {e}")
        raise

def get_status_description(status):
    descriptions = {
        'C': 'Compensated - The liver is functioning adequately despite some damage.',
        'CL': 'Controlled - The condition is being managed with treatment.',
        'D': 'Decompensated - The liver has significant dysfunction and requires immediate medical attention.'
    }
    return descriptions.get(status, 'Unknown status')

def get_risk_level(status):
    risk_levels = {
        'C': 'Low',
        'CL': 'Medium', 
        'D': 'High'
    }
    return risk_levels.get(status, 'Unknown')

def make_prediction(data):
    """Core prediction logic shared by both endpoints"""
    try:
        logger.info("Starting prediction process")
        
        # Add default values for clinical exam features
        data.setdefault('Ascites', 'N')
        data.setdefault('Hepatomegaly', 'N')
        data.setdefault('Spiders', 'N')
        data.setdefault('Edema', 'N')
        data.setdefault('Drug', 'Placebo')
        data.setdefault('Tryglicerides', 100)
        
        logger.info(f"Data after defaults: {data}")
        
        is_valid, message = validate_input_data(data)
        if not is_valid:
            logger.error(f"Input validation failed: {message}")
            return None, message
        
        logger.info("Input validation passed")
        
        processed_data = preprocess_input(data)
        logger.info(f"Data preprocessing completed, shape: {processed_data.shape}")
        
        probabilities = model.predict_proba(processed_data)[0]
        predicted_class_idx = np.argmax(probabilities)
        
        logger.info(f"Model prediction completed: class_idx={predicted_class_idx}")
        
        label_encoder = preprocessing_components['label_encoder']
        predicted_status = label_encoder.inverse_transform([predicted_class_idx])[0]
        
        prob_dict = {}
        for i, prob in enumerate(probabilities):
            class_name = label_encoder.inverse_transform([i])[0]
            prob_dict[class_name] = float(prob)
        
        response_data = {
            'predicted_status': predicted_status,
            'status_description': get_status_description(predicted_status),
            'probabilities': prob_dict,
            'risk_level': get_risk_level(predicted_status),
            'disclaimer': 'This prediction is not a medical diagnosis. Please consult your healthcare provider.'
        }
        
        logger.info(f"Prediction successful: {predicted_status}")
        return response_data, None
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return None, f'Prediction failed: {str(e)}'

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'LiverLens Prediction API',
        'model_loaded': model is not None,
        'preprocessing_loaded': preprocessing_components is not None,
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@app.route('/')
def home():
    return jsonify({
        'status': 'running',
        'message': 'LiverLens Prediction API',
        'version': '1.0.0',
        'endpoints': {
            'predict': '/predict (POST)',
            'predict-only': '/predict-only (POST)',
            'history': '/history (GET)',
            'health': '/health (GET)'
        }
    }), 200

@app.route('/predict-only', methods=['POST'])
@login_required
def predict_only():
    """Predict without saving to database - for playground use"""
    try:
        data = request.get_json()
        if not data:
            logger.error("No input data provided")
            return jsonify({'error': 'No input data provided'}), 400
        
        logger.info(f"Received playground prediction request for user {session['user_id']}")
        logger.info(f"Input data: {data}")
        
        response_data, error = make_prediction(data)
        if error:
            logger.error(f"Prediction error: {error}")
            return jsonify({'error': error}), 400
        
        logger.info(f"Playground prediction successful for user {session['user_id']}: {response_data['predicted_status']}")
        return jsonify(response_data), 200
    except Exception as e:
        logger.error(f"Playground prediction error: {str(e)}")
        return jsonify({'error': 'Prediction failed. Please try again.'}), 500

@app.route('/predict', methods=['POST'])
@login_required
def predict():
    """Predict and save to database"""
    try:
        data = request.get_json()
        if not data:
            logger.error("No input data provided")
            return jsonify({'error': 'No input data provided'}), 400
        
        logger.info(f"Received prediction request for user {session['user_id']}")
        logger.info(f"Input data: {data}")
        
        response_data, error = make_prediction(data)
        if error:
            logger.error(f"Prediction error: {error}")
            return jsonify({'error': error}), 400
        
        # Save prediction to database
        prediction_record = {
            'user_id': session['user_id'],
            'input_data': data,
            'prediction': response_data['predicted_status'],
            'probabilities': response_data['probabilities'],
            'risk_level': response_data['risk_level'],
            'timestamp': datetime.utcnow()
        }
        
        predictions_collection.insert_one(prediction_record)
        logger.info(f"Prediction made and saved for user {session['user_id']}: {response_data['predicted_status']}")
        return jsonify(response_data), 200
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': 'Prediction failed. Please try again.'}), 500

@app.route('/history/<prediction_id>', methods=['DELETE'])
@login_required
def delete_prediction(prediction_id):
    try:
        user_id = session['user_id']
        try:
            obj_id = ObjectId(prediction_id)
        except InvalidId:
            return jsonify({'error': 'Invalid prediction ID'}), 400
        
        prediction = predictions_collection.find_one({
            '_id': obj_id,
            'user_id': user_id
        })
        if not prediction:
            return jsonify({'error': 'Prediction not found or not authorized'}), 404
        
        result = predictions_collection.delete_one({'_id': obj_id})
        if result.deleted_count == 1:
            return jsonify({'message': 'Prediction deleted successfully'}), 200
        else:
            return jsonify({'error': 'Failed to delete prediction'}), 500
    except Exception as e:
        logger.error(f"Delete prediction error: {e}")
        return jsonify({'error': 'Failed to delete prediction'}), 500

@app.route('/history', methods=['GET'])
@login_required
def get_history():
    try:
        user_id = session['user_id']
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        skip = (page - 1) * per_page
        total_count = predictions_collection.count_documents({'user_id': user_id})
        predictions = list(predictions_collection.find(
            {'user_id': user_id}
        ).sort('timestamp', -1).skip(skip).limit(per_page))
        
        for prediction in predictions:
            prediction['_id'] = str(prediction['_id'])
            if 'timestamp' in prediction:
                prediction['timestamp'] = prediction['timestamp'].isoformat()
        
        response_data = {
            'predictions': predictions,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_count': total_count,
                'total_pages': (total_count + per_page - 1) // per_page
            }
        }
        return jsonify(response_data), 200
    except Exception as e:
        logger.error(f"History retrieval error: {e}")
        return jsonify({'error': 'Failed to retrieve prediction history'}), 500

@app.route('/stats', methods=['GET'])
@login_required
def get_stats():
    try:
        user_id = session['user_id']
        predictions = list(predictions_collection.find(
            {'user_id': user_id},
            {'prediction': 1, 'risk_level': 1, 'timestamp': 1}
        ))
        total_predictions = len(predictions)
        if total_predictions == 0:
            return jsonify({
                'total_predictions': 0,
                'status_distribution': {},
                'risk_distribution': {},
                'latest_prediction': None
            }), 200
        status_counts = {}
        risk_counts = {}
        for pred in predictions:
            status = pred.get('prediction', 'Unknown')
            risk = pred.get('risk_level', 'Unknown')
            status_counts[status] = status_counts.get(status, 0) + 1
            risk_counts[risk] = risk_counts.get(risk, 0) + 1
        latest_prediction = predictions_collection.find_one(
            {'user_id': user_id},
            sort=[('timestamp', -1)]
        )
        if latest_prediction:
            latest_prediction['timestamp'] = latest_prediction['timestamp'].isoformat()
            latest_prediction.pop('_id', None)
        response_data = {
            'total_predictions': total_predictions,
            'status_distribution': status_counts,
            'risk_distribution': risk_counts,
            'latest_prediction': latest_prediction
        }
        return jsonify(response_data), 200
    except Exception as e:
        logger.error(f"Stats retrieval error: {e}")
        return jsonify({'error': 'Failed to retrieve statistics'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_server_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    if model is None or preprocessing_components is None:
        logger.error("Model or preprocessing components not loaded. Exiting...")
        exit(1)
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    logger.info(f"Starting LiverLens Prediction API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)