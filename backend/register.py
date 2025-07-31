
import os
from flask import Flask, request, jsonify, session, make_response
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import re
from datetime import datetime
from dotenv import load_dotenv
from bson import ObjectId


load_dotenv()


app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'default-secret-key')


MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client["liverlens_db"]
users_collection = db["users"]


users_collection.create_index("email", unique=True)


@app.after_request
def add_cors_headers(response):
    allowed_origin = os.getenv('CORS_ALLOWED_ORIGIN', 'http://localhost:3000')
    response.headers['Access-Control-Allow-Origin'] = allowed_origin
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


@app.route('/register', methods=['OPTIONS'])
@app.route('/login', methods=['OPTIONS'])
@app.route('/logout', methods=['OPTIONS'])
@app.route('/profile', methods=['OPTIONS'])
def options_handler():
    return '', 200

def validate_password(password):
    """
    Validate password requirements:
    - At least 8 characters long
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    - Contains at least one special character
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one digit"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    
    return True, "Password is valid"

def validate_email(email):
    """Email validation with regex pattern"""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None

def validate_role(role):
    """Validate user role"""
    valid_roles = ['Doctor', 'Researcher', 'Student']
    return role in valid_roles

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'LiverLens Auth Service',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

# Root endpoint
@app.route('/')
def home():
    return jsonify({
        'status': 'running',
        'message': 'LiverLens Authentication Service',
        'version': '1.0.0',
        'endpoints': {
            'register': '/register (POST)',
            'login': '/login (POST)',
            'logout': '/logout (POST)',
            'profile': '/profile (GET)',
            'health': '/health (GET)'
        }
    }), 200

@app.route('/register', methods=['POST'])
def register():
    try:
        # Get data from request
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        # Extract required fields
        full_name = data.get('full_name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        role = data.get('role', '').strip()
        
        # Validate required fields
        if not full_name:
            return jsonify({'error': 'Full name is required'}), 400
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        if not confirm_password:
            return jsonify({'error': 'Password confirmation is required'}), 400
        
        if not role:
            return jsonify({'error': 'User role is required'}), 400
        
        # Validate field formats
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if not validate_role(role):
            return jsonify({'error': 'Invalid user role'}), 400
        
        if password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400
        
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Check for existing user
        if users_collection.find_one({'email': email}):
            return jsonify({'error': 'Email is already registered'}), 409
        
        # Prepare user document
        user_doc = {
            'full_name': full_name,
            'email': email,
            'password_hash': generate_password_hash(password),
            'role': role,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'last_login': None
        }
        
        # Add role-specific fields
        if role == 'Doctor':
            user_doc['doctor_info'] = {
                'medical_license_id': data.get('medical_license_id', '').strip(),
                'specialty': data.get('specialty', '').strip(),
                'hospital_clinic_name': data.get('hospital_clinic_name', '').strip(),
                'country': data.get('country', '').strip()
            }
        elif role in ['Researcher', 'Student']:
            user_doc['academic_info'] = {
                'institution_name': data.get('institution_name', '').strip(),
                'department': data.get('department', '').strip(),
                'role_title': data.get('role_title', '').strip()
            }
        
        # Insert into database
        result = users_collection.insert_one(user_doc)
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        if 'duplicate key error' in str(e).lower():
            return jsonify({'error': 'Email is already registered'}), 409
        app.logger.error(f'Registration error: {str(e)}')
        return jsonify({'error': 'Registration failed. Please try again.'}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json() if request.is_json else request.form.to_dict()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = users_collection.find_one({'email': email})
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Update session
        session['user_id'] = str(user['_id'])
        session['email'] = user['email']
        session['role'] = user['role']
        
        # Update last login
        users_collection.update_one(
            {'_id': user['_id']},
            {'$set': {'last_login': datetime.utcnow()}}
        )
        
        response_data = {
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': str(user['_id']),
                'full_name': user['full_name'],
                'email': user['email'],
                'role': user['role'],
                'created_at': user.get('created_at').isoformat() if user.get('created_at') else None,
                'last_login': user.get('last_login').isoformat() if user.get('last_login') else None
            }
        }
        
        if user['role'] == 'Doctor' and 'doctor_info' in user:
            response_data['user']['doctor_info'] = user['doctor_info']
        elif user['role'] in ['Researcher', 'Student'] and 'academic_info' in user:
            response_data['user']['academic_info'] = user['academic_info']
        
        return jsonify(response_data), 200
        
    except Exception as e:
        app.logger.error(f'Login error: {str(e)}')
        return jsonify({'error': 'Login failed. Please try again.'}), 500

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200

@app.route('/profile', methods=['GET'])
def get_profile():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        user_id = session['user_id']
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
      
        profile_data = {
            'id': str(user['_id']),
            'full_name': user['full_name'],
            'email': user['email'],
            'role': user['role'],
            'created_at': user.get('created_at').isoformat() if user.get('created_at') else None,
            'last_login': user.get('last_login').isoformat() if user.get('last_login') else None
        }
        
        # Add role-specific info
        if user['role'] == 'Doctor' and 'doctor_info' in user:
            profile_data['doctor_info'] = user['doctor_info']
        elif user['role'] in ['Researcher', 'Student'] and 'academic_info' in user:
            profile_data['academic_info'] = user['academic_info']
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        app.logger.error(f'Profile error: {str(e)}')
        return jsonify({'error': 'Failed to retrieve profile'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)))