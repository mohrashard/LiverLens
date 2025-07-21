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
from collections import defaultdict
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
@app.route('/predict/bulk', methods=['OPTIONS'])
@app.route('/api/explore', methods=['OPTIONS'])
@app.route('/api/analysis/summary', methods=['OPTIONS'])
@app.route('/api/analysis/outcomes', methods=['OPTIONS'])
@app.route('/api/analysis/feature-distribution', methods=['OPTIONS'])
@app.route('/api/analysis/correlation', methods=['OPTIONS'])
@app.route('/api/analysis/feature-importance', methods=['OPTIONS'])
@app.route('/api/analysis/temporal-trends', methods=['OPTIONS'])
@app.route('/api/analysis/subgroup-comparison', methods=['OPTIONS'])
def options_handler(prediction_id=None):
    return '', 200

@app.route('/history/bulk-delete', methods=['OPTIONS'])
def options_bulk_delete():
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
        'Patient_Name', 'Patient_ID', 'N_Days', 'Drug', 'Age', 'Sex', 'Ascites', 
        'Hepatomegaly', 'Spiders', 'Edema', 'Bilirubin', 'Cholesterol', 'Albumin',
        'Copper', 'Alk_Phos', 'SGOT', 'Tryglicerides', 'Platelets', 'Prothrombin', 'Stage'
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
    
    if data['Sex'] not in [None, '', 'null'] and str(data['Sex']).upper() not in ['M', 'F', 'MALE', 'FEMALE']:
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
        processed_data = data.copy()
        
        for key in processed_data:
            if processed_data[key] in [None, '', 'null']:
                processed_data[key] = np.nan
        
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
        
        categorical_features = ['Drug', 'Sex', 'Ascites', 'Hepatomegaly', 'Spiders', 'Edema']
        for feature in categorical_features:
            if feature in processed_data and processed_data[feature] not in [None, '', 'null']:
                processed_data[feature] = str(processed_data[feature]).upper()[0]
            else:
                processed_data[feature] = 'N'
        
        df = pd.DataFrame([processed_data])
        
        imputer = preprocessing_components['imputer']
        df[numerical_features] = imputer.transform(df[numerical_features])
        
        categorical_encoders = preprocessing_components.get('categorical_encoders', {})
        for feature in categorical_features:
            if feature in categorical_encoders and feature in df.columns:
                encoder = categorical_encoders[feature]
                try:
                    df[feature] = encoder.transform(df[feature].astype(str))
                except ValueError:
                    df[feature] = encoder.transform([encoder.classes_[0]])[0]
        
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
        'D': 'Decompensated - The liver has significant dysfunction.'
    }
    return descriptions.get(status, 'Unknown status')

def get_risk_level(status):
    risk_levels = {'C': 'Low', 'CL': 'Medium', 'D': 'High'}
    return risk_levels.get(status, 'Unknown')

def make_prediction(data):
    try:
        logger.info("Starting prediction process")
        
        data.setdefault('Ascites', 'N')
        data.setdefault('Hepatomegaly', 'N')
        data.setdefault('Spiders', 'N')
        data.setdefault('Edema', 'N')
        data.setdefault('Drug', 'Placebo')
        data.setdefault('Tryglicerides', 100)
        
        is_valid, message = validate_input_data(data)
        if not is_valid:
            logger.error(f"Input validation failed: {message}")
            return None, message
        
        processed_data = preprocess_input(data)
        probabilities = model.predict_proba(processed_data)[0]
        predicted_class_idx = np.argmax(probabilities)
        label_encoder = preprocessing_components['label_encoder']
        predicted_status = label_encoder.inverse_transform([predicted_class_idx])[0]
        
        prob_dict = {label_encoder.inverse_transform([i])[0]: float(prob) for i, prob in enumerate(probabilities)}
        
        return {
            'predicted_status': predicted_status,
            'status_description': get_status_description(predicted_status),
            'probabilities': prob_dict,
            'risk_level': get_risk_level(predicted_status),
            'disclaimer': 'This prediction is not a medical diagnosis.'
        }, None
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return None, f'Prediction failed: {str(e)}'

@app.route('/predict/bulk', methods=['POST'])
@login_required
def predict_bulk():
    if session.get('role') != 'Doctor':
        return jsonify({'error': 'Access denied. Only available to doctors.'}), 403

    if 'csv_file' not in request.files:
        return jsonify({'error': 'No CSV file provided'}), 400

    file = request.files['csv_file']
    if file.filename == '' or not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'Please upload a CSV file'}), 400

    try:
        df = pd.read_csv(file)
        required_columns = [
            'Patient_Name', 'Patient_ID', 'N_Days', 'Drug', 'Age', 'Sex', 'Ascites', 
            'Hepatomegaly', 'Spiders', 'Edema', 'Bilirubin', 'Cholesterol', 'Albumin',
            'Copper', 'Alk_Phos', 'SGOT', 'Tryglicerides', 'Platelets', 'Prothrombin', 'Stage'
        ]
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return jsonify({'error': f'Missing columns: {", ".join(missing_columns)}'}), 400

        predictions_to_save = []
        predictions = []
        for index, row in df.iterrows():
            data = row.to_dict()
            response_data, error = make_prediction(data)
            if error:
                return jsonify({'error': f'Error at row {index + 1}: {error}'}), 400
            prediction_record = {
                'user_id': session['user_id'],
                'input_data': data,
                'prediction': response_data['predicted_status'],
                'probabilities': response_data['probabilities'],
                'risk_level': response_data['risk_level'],
                'timestamp': datetime.utcnow()
            }
            predictions_to_save.append(prediction_record)
            predictions.append({
                **data,
                'predicted_status': response_data['predicted_status'],
                'status_description': response_data['status_description'],
                'risk_level': response_data['risk_level'],
                'probability_C': response_data['probabilities'].get('C', 0),
                'probability_CL': response_data['probabilities'].get('CL', 0),
                'probability_D': response_data['probabilities'].get('D', 0),
            })

        if predictions_to_save:
            predictions_collection.insert_many(predictions_to_save)

        logger.info(f"Bulk prediction completed: {len(predictions)} predictions")
        return jsonify({'predictions': predictions}), 200
    except Exception as e:
        logger.error(f"Bulk prediction error: {str(e)}")
        return jsonify({'error': 'Failed to process CSV file'}), 500

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
            'health': '/health (GET)',
            'predict/bulk': '/predict/bulk (POST)',
            'explore': '/api/explore (GET)'
        }
    }), 200

@app.route('/predict-only', methods=['POST'])
@login_required
def predict_only():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        response_data, error = make_prediction(data)
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify(response_data), 200
    except Exception as e:
        logger.error(f"Playground prediction error: {str(e)}")
        return jsonify({'error': 'Prediction failed'}), 500

@app.route('/predict', methods=['POST'])
@login_required
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        response_data, error = make_prediction(data)
        if error:
            return jsonify({'error': error}), 400
        
        prediction_record = {
            'user_id': session['user_id'],
            'input_data': data,
            'prediction': response_data['predicted_status'],
            'probabilities': response_data['probabilities'],
            'risk_level': response_data['risk_level'],
            'timestamp': datetime.utcnow()
        }
        
        predictions_collection.insert_one(prediction_record)
        return jsonify(response_data), 200
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': 'Prediction failed'}), 500

@app.route('/history/<prediction_id>', methods=['DELETE'])
@login_required
def delete_prediction(prediction_id):
    try:
        user_id = session['user_id']
        try:
            obj_id = ObjectId(prediction_id)
        except InvalidId:
            return jsonify({'error': 'Invalid prediction ID'}), 400
        
        prediction = predictions_collection.find_one({'_id': obj_id, 'user_id': user_id})
        if not prediction:
            return jsonify({'error': 'Prediction not found or not authorized'}), 404
        
        result = predictions_collection.delete_one({'_id': obj_id})
        if result.deleted_count == 1:
            return jsonify({'message': 'Prediction deleted successfully'}), 200
        return jsonify({'error': 'Failed to delete prediction'}), 500
    except Exception as e:
        logger.error(f"Delete prediction error: {e}")
        return jsonify({'error': 'Failed to delete prediction'}), 500

@app.route('/history', methods=['GET'])
@login_required
def get_history():
    try:
        user_id = session['user_id']
        patient_id = request.args.get('patient_id')  # Get patient_id from query params
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        skip = (page - 1) * per_page
        
        # Build query with patient_id filter
        query = {'user_id': user_id}
        if patient_id:
            query['input_data.Patient_ID'] = patient_id
        
        total_count = predictions_collection.count_documents(query)
        predictions = list(predictions_collection.find(query)
                          .sort('timestamp', -1).skip(skip).limit(per_page))
        
        for prediction in predictions:
            prediction['_id'] = str(prediction['_id'])
            if 'timestamp' in prediction:
                prediction['timestamp'] = prediction['timestamp'].isoformat()
        
        return jsonify({
            'predictions': predictions,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_count': total_count,
                'total_pages': (total_count + per_page - 1) // per_page
            }
        }), 200
    except Exception as e:
        logger.error(f"History retrieval error: {e}")
        return jsonify({'error': 'Failed to retrieve prediction history'}), 500


@app.route('/history/bulk-delete', methods=['DELETE'])
@login_required
def bulk_delete_predictions():
    try:
        data = request.get_json()
        if not data or 'prediction_ids' not in data:
            return jsonify({'error': 'No prediction IDs provided'}), 400
        
        prediction_ids = data['prediction_ids']
        if not isinstance(prediction_ids, list) or not prediction_ids:
            return jsonify({'error': 'Invalid prediction IDs format'}), 400
        
        valid_ids = []
        for pred_id in prediction_ids:
            try:
                valid_ids.append(ObjectId(pred_id))
            except InvalidId:
                return jsonify({'error': f'Invalid prediction ID: {pred_id}'}), 400
        
        user_id = session['user_id']
        user_predictions = predictions_collection.find({'_id': {'$in': valid_ids}, 'user_id': user_id})
        user_prediction_ids = [pred['_id'] for pred in user_predictions]
        
        if len(user_prediction_ids) != len(valid_ids):
            return jsonify({'error': 'Some predictions not found or not authorized'}), 403
        
        delete_result = predictions_collection.delete_many({'_id': {'$in': valid_ids}, 'user_id': user_id})
        if delete_result.deleted_count > 0:
            return jsonify({
                'message': f'Successfully deleted {delete_result.deleted_count} predictions',
                'deleted_count': delete_result.deleted_count
            }), 200
        return jsonify({'error': 'No predictions were deleted'}), 400
    except Exception as e:
        logger.error(f"Bulk delete error: {e}")
        return jsonify({'error': 'Failed to delete predictions'}), 500  
    
@app.route('/api/analysis/summary', methods=['GET'])
@login_required
def get_analysis_summary():
    """Get summary statistics for all predictions"""
    if session.get('role') != 'Researcher':
        return jsonify({'error': 'Access denied. Restricted to researchers.'}), 403
    
    try:
        # Aggregate pipeline for summary statistics
        pipeline = [
            {
                '$group': {
                    '_id': None,
                    'total_predictions': {'$sum': 1},
                    'avg_age': {'$avg': '$input_data.Age'},
                    'avg_bilirubin': {'$avg': '$input_data.Bilirubin'},
                    'avg_albumin': {'$avg': '$input_data.Albumin'},
                    'avg_cholesterol': {'$avg': '$input_data.Cholesterol'},
                    'avg_copper': {'$avg': '$input_data.Copper'},
                    'avg_alk_phos': {'$avg': '$input_data.Alk_Phos'},
                    'avg_sgot': {'$avg': '$input_data.SGOT'},
                    'avg_tryglicerides': {'$avg': '$input_data.Tryglicerides'},
                    'avg_platelets': {'$avg': '$input_data.Platelets'},
                    'avg_prothrombin': {'$avg': '$input_data.Prothrombin'},
                    'high_risk_count': {
                        '$sum': {'$cond': [{'$eq': ['$risk_level', 'High']}, 1, 0]}
                    },
                    'medium_risk_count': {
                        '$sum': {'$cond': [{'$eq': ['$risk_level', 'Medium']}, 1, 0]}
                    },
                    'low_risk_count': {
                        '$sum': {'$cond': [{'$eq': ['$risk_level', 'Low']}, 1, 0]}
                    }
                }
            }
        ]
        
        result = list(predictions_collection.aggregate(pipeline))
        
        if not result:
            return jsonify({
                'total_predictions': 0,
                'avg_age': 0,
                'avg_bilirubin': 0,
                'avg_albumin': 0,
                'avg_cholesterol': 0,
                'avg_copper': 0,
                'avg_alk_phos': 0,
                'avg_sgot': 0,
                'avg_tryglicerides': 0,
                'avg_platelets': 0,
                'avg_prothrombin': 0,
                'high_risk_count': 0,
                'medium_risk_count': 0,
                'low_risk_count': 0
            }), 200
        
        summary = result[0]
        summary.pop('_id', None)
        
        # Handle null values
        for key, value in summary.items():
            if value is None:
                summary[key] = 0
        
        return jsonify(summary), 200
        
    except Exception as e:
        logger.error(f"Analysis summary error: {str(e)}")
        return jsonify({'error': 'Failed to generate summary statistics'}), 500

@app.route('/api/analysis/outcomes', methods=['GET'])
@login_required
def get_prediction_outcomes():
    """Get prediction outcome distribution"""
    if session.get('role') != 'Researcher':
        return jsonify({'error': 'Access denied. Restricted to researchers.'}), 403
    
    try:
        # Count predictions by status
        pipeline = [
            {
                '$group': {
                    '_id': '$prediction',
                    'count': {'$sum': 1}
                }
            }
        ]
        
        results = list(predictions_collection.aggregate(pipeline))
        
        # Calculate total for percentages
        total = sum(result['count'] for result in results)
        
        if total == 0:
            return jsonify([]), 200
        
        # Format results
        outcomes = []
        for result in results:
            status = result['_id'] if result['_id'] else 'Unknown'
            outcomes.append({
                'status': status,
                'count': result['count'],
                'percentage': (result['count'] / total) * 100
            })
        
        # Sort by count descending
        outcomes.sort(key=lambda x: x['count'], reverse=True)
        
        return jsonify(outcomes), 200
        
    except Exception as e:
        logger.error(f"Prediction outcomes error: {str(e)}")
        return jsonify({'error': 'Failed to fetch prediction outcomes'}), 500

@app.route('/api/analysis/feature-distribution', methods=['GET'])
@login_required
def get_feature_distribution():
    """Get feature distribution histograms"""
    if session.get('role') != 'Researcher':
        return jsonify({'error': 'Access denied. Restricted to researchers.'}), 403
    
    try:
        # Get all predictions
        predictions = list(predictions_collection.find({}, {'input_data': 1}))
        
        if not predictions:
            return jsonify({}), 200
        
        # Extract numerical features
        numerical_features = [
            'Age', 'Bilirubin', 'Cholesterol', 'Albumin', 'Copper',
            'Alk_Phos', 'SGOT', 'Tryglicerides', 'Platelets', 'Prothrombin'
        ]
        
        distributions = {}
        
        for feature in numerical_features:
            # Extract values for this feature
            values = []
            for pred in predictions:
                if 'input_data' in pred and feature in pred['input_data']:
                    val = pred['input_data'][feature]
                    if val is not None:
                        try:
                            val_float = float(val)
                            if not np.isnan(val_float) and not np.isinf(val_float):
                                values.append(val_float)
                        except (ValueError, TypeError):
                            continue
            
            if not values:
                continue
            
            # Calculate statistics
            values_array = np.array(values)
            mean_val = np.mean(values_array)
            std_val = np.std(values_array)
            
            # Create histogram bins
            min_val = np.min(values_array)
            max_val = np.max(values_array)
            
            # Avoid division by zero
            if min_val == max_val:
                bins = np.array([min_val - 0.5, max_val + 0.5])
            else:
                bins = np.linspace(min_val, max_val, 11)  # 10 bins
            
            hist, bin_edges = np.histogram(values_array, bins=bins)
            
            # Format histogram data
            histogram_data = []
            max_count = max(hist) if len(hist) > 0 else 1
            
            for i in range(len(hist)):
                histogram_data.append({
                    'range': f"{bin_edges[i]:.1f}-{bin_edges[i+1]:.1f}",
                    'count': int(hist[i])
                })
            
            distributions[feature] = {
                'histogram': histogram_data,
                'mean': float(mean_val),
                'std': float(std_val),
                'max_count': int(max_count)
            }
        
        return jsonify(distributions), 200
        
    except Exception as e:
        logger.error(f"Feature distribution error: {str(e)}")
        return jsonify({'error': 'Failed to calculate feature distributions'}), 500

@app.route('/api/analysis/correlation', methods=['GET'])
@login_required
def get_correlation_matrix():
    """Get correlation matrix for numerical features"""
    if session.get('role') != 'Researcher':
        return jsonify({'error': 'Access denied. Restricted to researchers.'}), 403
    
    try:
        # Get all predictions
        predictions = list(predictions_collection.find({}, {'input_data': 1}))
        
        if not predictions:
            return jsonify({'correlation_matrix': [], 'features': []}), 200
        
        # Extract numerical features
        numerical_features = [
            'Age', 'Bilirubin', 'Cholesterol', 'Albumin', 'Copper',
            'Alk_Phos', 'SGOT', 'Tryglicerides', 'Platelets', 'Prothrombin'
        ]
        
        # Create DataFrame
        data = []
        for pred in predictions:
            if 'input_data' not in pred:
                continue
            
            row = {}
            for feature in numerical_features:
                if feature in pred['input_data']:
                    val = pred['input_data'][feature]
                    if val is not None:
                        try:
                            val_float = float(val)
                            if not np.isnan(val_float) and not np.isinf(val_float):
                                row[feature] = val_float
                            else:
                                row[feature] = np.nan
                        except (ValueError, TypeError):
                            row[feature] = np.nan
                    else:
                        row[feature] = np.nan
                else:
                    row[feature] = np.nan
            data.append(row)
        
        if not data:
            return jsonify({'correlation_matrix': [], 'features': []}), 200
        
        df = pd.DataFrame(data)
        
        # Remove features with all NaN values
        df_clean = df.dropna(axis=1, how='all')
        
        if df_clean.empty:
            return jsonify({'correlation_matrix': [], 'features': []}), 200
        
        # Calculate correlation matrix
        correlation_matrix = df_clean.corr()
        
        # Convert to list format for frontend
        correlation_list = correlation_matrix.values.tolist()
        features_list = correlation_matrix.columns.tolist()
        
        # Replace NaN values with 0
        for i in range(len(correlation_list)):
            for j in range(len(correlation_list[i])):
                if pd.isna(correlation_list[i][j]):
                    correlation_list[i][j] = 0
        
        return jsonify({
            'correlation_matrix': correlation_list,
            'features': features_list
        }), 200
        
    except Exception as e:
        logger.error(f"Correlation matrix error: {str(e)}")
        return jsonify({'error': 'Failed to calculate correlation matrix'}), 500

@app.route('/api/analysis/feature-importance', methods=['GET'])
@login_required
def get_feature_importance():
    """Get feature importance from the trained model"""
    if session.get('role') != 'Researcher':
        return jsonify({'error': 'Access denied. Restricted to researchers.'}), 403
    
    try:
        if model is None or preprocessing_components is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Get feature names and importances
        feature_names = preprocessing_components.get('feature_names', [])
        
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        else:
            # Fallback for models without feature_importances_
            logger.warning("Model does not have feature_importances_ attribute")
            importances = np.random.random(len(feature_names))  # Placeholder
        
        if len(importances) != len(feature_names):
            logger.warning(f"Mismatch between importances ({len(importances)}) and feature names ({len(feature_names)})")
            # Adjust to match
            min_len = min(len(importances), len(feature_names))
            importances = importances[:min_len]
            feature_names = feature_names[:min_len]
        
        # Combine and sort by importance
        feature_importance = [
            {'feature': name, 'importance': float(importance)}
            for name, importance in zip(feature_names, importances)
        ]
        
        feature_importance.sort(key=lambda x: x['importance'], reverse=True)
        
        return jsonify(feature_importance), 200
        
    except Exception as e:
        logger.error(f"Feature importance error: {str(e)}")
        return jsonify({'error': 'Failed to get feature importance'}), 500

@app.route('/api/analysis/temporal-trends', methods=['GET'])
@login_required
def get_temporal_trends():
    """Get temporal trends of predictions"""
    if session.get('role') != 'Researcher':
        return jsonify({'error': 'Access denied. Restricted to researchers.'}), 403
    
    try:
        # Get predictions with timestamps
        predictions = list(predictions_collection.find({}, {'timestamp': 1}))
        
        if not predictions:
            return jsonify([]), 200
        
        # Group by date
        date_counts = defaultdict(int)
        
        for pred in predictions:
            timestamp = pred.get('timestamp')
            if timestamp:
                try:
                    if isinstance(timestamp, str):
                        # Parse string timestamp
                        timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    date_str = timestamp.strftime('%Y-%m-%d')
                    date_counts[date_str] += 1
                except (ValueError, AttributeError) as e:
                    logger.warning(f"Invalid timestamp format: {timestamp}, error: {e}")
                    continue
        
        # Convert to list and sort by date
        trends = [
            {'date': date, 'count': count}
            for date, count in date_counts.items()
        ]
        
        trends.sort(key=lambda x: x['date'])
        
        return jsonify(trends), 200
        
    except Exception as e:
        logger.error(f"Temporal trends error: {str(e)}")
        return jsonify({'error': 'Failed to get temporal trends'}), 500

@app.route('/api/analysis/subgroup-comparison', methods=['GET'])
@login_required
def get_subgroup_comparison():
    """Get comparison between different subgroups"""
    if session.get('role') != 'Researcher':
        return jsonify({'error': 'Access denied. Restricted to researchers.'}), 403
    
    try:
        # Get all predictions
        predictions = list(predictions_collection.find({}, {'input_data': 1, 'risk_level': 1}))
        
        if not predictions:
            return jsonify({}), 200
        
        comparisons = {}
        
        # Helper function to safely get numeric value
        def safe_float(value):
            if value is None:
                return None
            try:
                return float(value)
            except (ValueError, TypeError):
                return None
        
        # Helper function to calculate group statistics
        def calculate_group_stats(group_preds):
            if not group_preds:
                return {
                    'count': 0,
                    'avg_age': None,
                    'avg_bilirubin': None,
                    'avg_albumin': None
                }
            
            ages = [safe_float(p.get('input_data', {}).get('Age')) for p in group_preds]
            ages = [age for age in ages if age is not None]
            
            bilirubins = [safe_float(p.get('input_data', {}).get('Bilirubin')) for p in group_preds]
            bilirubins = [bil for bil in bilirubins if bil is not None]
            
            albumins = [safe_float(p.get('input_data', {}).get('Albumin')) for p in group_preds]
            albumins = [alb for alb in albumins if alb is not None]
            
            return {
                'count': len(group_preds),
                'avg_age': float(np.mean(ages)) if ages else None,
                'avg_bilirubin': float(np.mean(bilirubins)) if bilirubins else None,
                'avg_albumin': float(np.mean(albumins)) if albumins else None
            }
        
        # Gender comparison
        gender_groups = {'Male': [], 'Female': []}
        for pred in predictions:
            sex = pred.get('input_data', {}).get('Sex', 'M')
            if sex:
                sex = str(sex).upper()
                if sex in ['M', 'MALE']:
                    gender_groups['Male'].append(pred)
                elif sex in ['F', 'FEMALE']:
                    gender_groups['Female'].append(pred)
        
        comparisons['gender'] = {}
        for group, group_preds in gender_groups.items():
            comparisons['gender'][group] = calculate_group_stats(group_preds)
        
        # Risk level comparison
        risk_groups = {'Low': [], 'Medium': [], 'High': []}
        for pred in predictions:
            risk = pred.get('risk_level', 'Low')
            if risk and risk in risk_groups:
                risk_groups[risk].append(pred)
        
        comparisons['risk_level'] = {}
        for group, group_preds in risk_groups.items():
            comparisons['risk_level'][group] = calculate_group_stats(group_preds)
        
        # Age group comparison
        age_groups = {'Under_50': [], 'Over_50': []}
        for pred in predictions:
            age = safe_float(pred.get('input_data', {}).get('Age'))
            if age is not None and age > 0:
                group = 'Under_50' if age < 50 else 'Over_50'
                age_groups[group].append(pred)
        
        comparisons['age_group'] = {}
        for group, group_preds in age_groups.items():
            comparisons['age_group'][group] = calculate_group_stats(group_preds)
        
        # Stage comparison
        stage_groups = {'Stage_1': [], 'Stage_2': [], 'Stage_3': [], 'Stage_4': []}
        for pred in predictions:
            stage = safe_float(pred.get('input_data', {}).get('Stage'))
            if stage is not None and 1 <= stage <= 4:
                stage_key = f'Stage_{int(stage)}'
                stage_groups[stage_key].append(pred)
        
        comparisons['stage'] = {}
        for group, group_preds in stage_groups.items():
            if group_preds:  # Only include non-empty groups
                comparisons['stage'][group] = calculate_group_stats(group_preds)
        
        # Drug comparison
        drug_groups = defaultdict(list)
        for pred in predictions:
            drug = pred.get('input_data', {}).get('Drug', 'Unknown')
            if drug:
                drug_groups[str(drug)].append(pred)
        
        comparisons['drug'] = {}
        for group, group_preds in drug_groups.items():
            if len(group_preds) >= 5:  # Only include groups with at least 5 predictions
                comparisons['drug'][group] = calculate_group_stats(group_preds)
        
        return jsonify(comparisons), 200
        
    except Exception as e:
        logger.error(f"Subgroup comparison error: {str(e)}")
        return jsonify({'error': 'Failed to get subgroup comparison'}), 500     

@app.route('/stats', methods=['GET'])
@login_required
def get_stats():
    try:
        user_id = session['user_id']
        predictions = list(predictions_collection.find({'user_id': user_id}, {'prediction': 1, 'risk_level': 1, 'timestamp': 1}))
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
        
        latest_prediction = predictions_collection.find_one({'user_id': user_id}, sort=[('timestamp', -1)])
        if latest_prediction:
            latest_prediction['timestamp'] = latest_prediction['timestamp'].isoformat()
            latest_prediction.pop('_id', None)
        
        return jsonify({
            'total_predictions': total_predictions,
            'status_distribution': status_counts,
            'risk_distribution': risk_counts,
            'latest_prediction': latest_prediction
        }), 200
    except Exception as e:
        logger.error(f"Stats retrieval error: {e}")
        return jsonify({'error': 'Failed to retrieve statistics'}), 500


@app.route('/api/explore', methods=['GET'])
@login_required
def explore_data():
    if session.get('role') != 'Researcher':
        return jsonify({'error': 'Access denied. Restricted to researchers.'}), 403
    
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        sort_key = request.args.get('sort_key', 'timestamp')
        sort_direction = request.args.get('sort_direction', 'desc')
        
        filters = {
            'risk_level': request.args.get('risk_level', ''),
            'min_age': request.args.get('min_age', ''),
            'max_age': request.args.get('max_age', ''),
            'min_bilirubin': request.args.get('min_bilirubin', ''),
            'max_bilirubin': request.args.get('max_bilirubin', ''),
            'min_albumin': request.args.get('min_albumin', ''),
            'max_albumin': request.args.get('max_albumin', ''),
            'min_alt': request.args.get('min_alt', ''),
            'max_alt': request.args.get('max_alt', ''),
            'min_ast': request.args.get('min_ast', ''),
            'max_ast': request.args.get('max_ast', ''),
            'min_copper': request.args.get('min_copper', ''),
            'max_copper': request.args.get('max_copper', ''),
            'min_alk_phos': request.args.get('min_alk_phos', ''),
            'max_alk_phos': request.args.get('max_alk_phos', ''),
            'min_tryglicerides': request.args.get('min_tryglicerides', ''),
            'max_tryglicerides': request.args.get('max_tryglicerides', ''),
            'min_prothrombin': request.args.get('min_prothrombin', ''),
            'max_prothrombin': request.args.get('max_prothrombin', ''),
            'stage': request.args.get('stage', ''),
            'drug': request.args.get('drug', ''),
            'ascites': request.args.get('ascites', ''),
            'hepatomegaly': request.args.get('hepatomegaly', ''),
            'spiders': request.args.get('spiders', ''),
            'edema': request.args.get('edema', ''),
            'date_from': request.args.get('date_from', ''),
            'date_to': request.args.get('date_to', ''),
            'search_term': request.args.get('search_term', '')
        }

        # Build MongoDB query
        query = {}
        
        # Risk level filter
        if filters['risk_level']:
            query['risk_level'] = filters['risk_level']
            
        # Age filters
        if filters['min_age']:
            query['input_data.Age'] = {'$gte': float(filters['min_age'])}
        if filters['max_age']:
            query['input_data.Age'] = query.get('input_data.Age', {})
            query['input_data.Age']['$lte'] = float(filters['max_age'])
            
        # Bilirubin filters
        if filters['min_bilirubin']:
            query['input_data.Bilirubin'] = {'$gte': float(filters['min_bilirubin'])}
        if filters['max_bilirubin']:
            query['input_data.Bilirubin'] = query.get('input_data.Bilirubin', {})
            query['input_data.Bilirubin']['$lte'] = float(filters['max_bilirubin'])
            
        # Albumin filters
        if filters['min_albumin']:
            query['input_data.Albumin'] = {'$gte': float(filters['min_albumin'])}
        if filters['max_albumin']:
            query['input_data.Albumin'] = query.get('input_data.Albumin', {})
            query['input_data.Albumin']['$lte'] = float(filters['max_albumin'])
            
        # ALT (SGOT) filters
        if filters['min_alt']:
            query['input_data.SGOT'] = {'$gte': float(filters['min_alt'])}
        if filters['max_alt']:
            query['input_data.SGOT'] = query.get('input_data.SGOT', {})
            query['input_data.SGOT']['$lte'] = float(filters['max_alt'])
            
        # AST (Alk_Phos) filters  
        if filters['min_ast']:
            query['input_data.Alk_Phos'] = {'$gte': float(filters['min_ast'])}
        if filters['max_ast']:
            query['input_data.Alk_Phos'] = query.get('input_data.Alk_Phos', {})
            query['input_data.Alk_Phos']['$lte'] = float(filters['max_ast'])
            
        # Copper filters
        if filters['min_copper']:
            query['input_data.Copper'] = {'$gte': float(filters['min_copper'])}
        if filters['max_copper']:
            query['input_data.Copper'] = query.get('input_data.Copper', {})
            query['input_data.Copper']['$lte'] = float(filters['max_copper'])
            
        # Alkaline Phosphatase filters (additional)
        if filters['min_alk_phos']:
            query['input_data.Alk_Phos'] = query.get('input_data.Alk_Phos', {})
            query['input_data.Alk_Phos']['$gte'] = float(filters['min_alk_phos'])
        if filters['max_alk_phos']:
            query['input_data.Alk_Phos'] = query.get('input_data.Alk_Phos', {})
            query['input_data.Alk_Phos']['$lte'] = float(filters['max_alk_phos'])
            
        # Tryglicerides filters
        if filters['min_tryglicerides']:
            query['input_data.Tryglicerides'] = {'$gte': float(filters['min_tryglicerides'])}
        if filters['max_tryglicerides']:
            query['input_data.Tryglicerides'] = query.get('input_data.Tryglicerides', {})
            query['input_data.Tryglicerides']['$lte'] = float(filters['max_tryglicerides'])
            
        # Prothrombin filters
        if filters['min_prothrombin']:
            query['input_data.Prothrombin'] = {'$gte': float(filters['min_prothrombin'])}
        if filters['max_prothrombin']:
            query['input_data.Prothrombin'] = query.get('input_data.Prothrombin', {})
            query['input_data.Prothrombin']['$lte'] = float(filters['max_prothrombin'])
            
        # Categorical filters
        if filters['stage']:
            query['input_data.Stage'] = float(filters['stage'])
        if filters['drug']:
            query['input_data.Drug'] = filters['drug']
        if filters['ascites']:
            query['input_data.Ascites'] = filters['ascites']
        if filters['hepatomegaly']:
            query['input_data.Hepatomegaly'] = filters['hepatomegaly']
        if filters['spiders']:
            query['input_data.Spiders'] = filters['spiders']
        if filters['edema']:
            query['input_data.Edema'] = filters['edema']
            
        # Date filters
        if filters['date_from']:
            query['timestamp'] = {'$gte': datetime.fromisoformat(filters['date_from'])}
        if filters['date_to']:
            query['timestamp'] = query.get('timestamp', {})
            query['timestamp']['$lte'] = datetime.fromisoformat(filters['date_to'])
            
        # Search filter
        if filters['search_term']:
            query['$or'] = [
                {'_id': {'$regex': filters['search_term'], '$options': 'i'}},
                {'input_data.Patient_ID': {'$regex': filters['search_term'], '$options': 'i'}}
            ]

        # Sorting
        sort_order = -1 if sort_direction == 'desc' else 1
        sort_field_mapping = {
            'record_id': '_id',
            'n_days': 'input_data.N_Days',
            'drug': 'input_data.Drug',
            'age': 'input_data.Age',
            'sex': 'input_data.Sex',
            'ascites': 'input_data.Ascites',
            'hepatomegaly': 'input_data.Hepatomegaly',
            'spiders': 'input_data.Spiders',
            'edema': 'input_data.Edema',
            'bilirubin': 'input_data.Bilirubin',
            'cholesterol': 'input_data.Cholesterol',
            'albumin': 'input_data.Albumin',
            'copper': 'input_data.Copper',
            'alk_phos': 'input_data.Alk_Phos',
            'sgot': 'input_data.SGOT',
            'tryglicerides': 'input_data.Tryglicerides',
            'platelets': 'input_data.Platelets',
            'prothrombin': 'input_data.Prothrombin',
            'stage': 'input_data.Stage',
            'risk_level': 'risk_level',
            'timestamp': 'timestamp'
        }
        sort_field = sort_field_mapping.get(sort_key, 'timestamp')

        # Fetch Data with pagination
        total_count = predictions_collection.count_documents(query)
        predictions = list(predictions_collection.find(query)
                          .sort(sort_field, sort_order)
                          .skip((page - 1) * per_page)
                          .limit(per_page))

        # Transform Data - Include ALL features
        records = []
        for pred in predictions:
            input_data = pred.get('input_data', {})
            records.append({
                'record_id': str(pred['_id']),
                'n_days': input_data.get('N_Days'),
                'drug': input_data.get('Drug'),
                'age': input_data.get('Age'),
                'sex': input_data.get('Sex'),
                'ascites': input_data.get('Ascites'),
                'hepatomegaly': input_data.get('Hepatomegaly'),
                'spiders': input_data.get('Spiders'),
                'edema': input_data.get('Edema'),
                'bilirubin': input_data.get('Bilirubin'),
                'cholesterol': input_data.get('Cholesterol'),
                'albumin': input_data.get('Albumin'),
                'copper': input_data.get('Copper'),
                'alk_phos': input_data.get('Alk_Phos'),
                'sgot': input_data.get('SGOT'),
                'tryglicerides': input_data.get('Tryglicerides'),
                'platelets': input_data.get('Platelets'),
                'prothrombin': input_data.get('Prothrombin'),
                'stage': input_data.get('Stage'),
                'risk_level': pred.get('risk_level', 'Unknown'),
                'timestamp': pred['timestamp'].isoformat()
            })

        # Calculate Enhanced Stats - FIXED PIPELINE
        pipeline = [
            {'$match': query},
            {'$group': {
                '_id': None,
                'total_records': {'$sum': 1},
                'avg_age': {'$avg': '$input_data.Age'},
                'avg_bilirubin': {'$avg': '$input_data.Bilirubin'},
                'avg_albumin': {'$avg': '$input_data.Albumin'},
                'avg_cholesterol': {'$avg': '$input_data.Cholesterol'},
                'avg_copper': {'$avg': '$input_data.Copper'},
                'avg_alk_phos': {'$avg': '$input_data.Alk_Phos'},
                'avg_alt': {'$avg': '$input_data.SGOT'},  # Changed from avg_sgot to avg_alt for consistency
                'avg_tryglicerides': {'$avg': '$input_data.Tryglicerides'},
                'avg_platelets': {'$avg': '$input_data.Platelets'},
                'avg_prothrombin': {'$avg': '$input_data.Prothrombin'},
                'max_alk_phos': {'$max': '$input_data.Alk_Phos'},
                'max_alt': {'$max': '$input_data.SGOT'},  # Changed from max_sgot to max_alt
                'min_age': {'$min': '$input_data.Age'},
                'max_age': {'$max': '$input_data.Age'}
            }}
        ]
        
        stats_result = list(predictions_collection.aggregate(pipeline))
        stats = stats_result[0] if stats_result else {
            'total_records': 0,
            'avg_age': None,
            'avg_bilirubin': None,
            'avg_albumin': None,
            'avg_cholesterol': None,
            'avg_copper': None,
            'avg_alk_phos': None,
            'avg_alt': None,  # Changed from avg_sgot to avg_alt
            'avg_tryglicerides': None,
            'avg_platelets': None,
            'avg_prothrombin': None
        }

        return jsonify({
            'records': records,
            'stats': stats,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_count': total_count,
                'total_pages': (total_count + per_page - 1) // per_page
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Explore data error: {str(e)}")
        return jsonify({'error': 'Failed to fetch data'}), 500
    
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