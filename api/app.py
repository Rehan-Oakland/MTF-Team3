import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, LoginManager, login_user, login_required, current_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
cors = CORS(app)

# Set configuration from environment variables
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("SQLALCHEMY_DATABASE_URI")
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
app.config['UPLOAD_FOLDER'] = 'uploads/'  # Folder to store uploaded receipts
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit upload size to 16MB

# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize database and login manager
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Define custom unauthorized handler
@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"message": "Unauthorized access"}), 401

# Define User model
class Users(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    active = db.Column(db.Boolean(), default=True)
    is_admin = db.Column(db.Boolean(), default=False)  # Admin flag

    def __repr__(self):
        return f'<User {self.username}>'

# Define Receipt model
class Receipts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __repr__(self):
        return f'<Receipt {self.filename}>'

@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(int(user_id))

@app.route('/', methods=['GET', 'POST'])
def home():
    return jsonify({'data': "hello world"})

@app.route('/users')
@login_required
def get_users():
    users = Users.query.all()
    return jsonify([{'id': user.id, 'username': user.username, 'email': user.email} for user in users])

@app.route('/register', methods=['GET', 'POST'])
def register():
    try:
        json_data = request.get_json()
        print("Received registration data:", json_data)
        
        if not json_data or not 'username' in json_data or not 'email' in json_data or not 'password' in json_data:
            return jsonify({"message": "Missing required fields"}), 400
        
        hashed_password = generate_password_hash(json_data['password'], method='pbkdf2:sha256')
        new_user = Users(
            username=json_data['username'],
            email=json_data['email'],
            password=hashed_password,
            is_admin=json_data.get('is_admin', False)  # Default to False unless specified
        )
        db.session.add(new_user)
        db.session.commit()
        print("User registered successfully:", new_user)
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print("Error during registration:", e)
        return jsonify({"message": "Error during registration"}), 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    json_data = request.get_json()
    user = Users.query.filter_by(username=json_data['username']).first()
    if user and check_password_hash(user.password, json_data['password']):
        login_user(user)
        return jsonify({"message": "Logged in successfully"})
    return jsonify({"message": "Invalid username or password"}), 401

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"})

@app.route('/upload_receipt', methods=['GET', 'POST'])
@login_required
def upload_receipt():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        new_receipt = Receipts(user_id=current_user.id, filename=filename)
        db.session.add(new_receipt)
        db.session.commit()
        
        return jsonify({"message": "Receipt uploaded successfully", "filename": filename}), 201

# Create the database tables within the app context
with app.app_context():
    try:
        print("Creating database tables...")
        db.create_all()
        print("Tables created successfully.")
    except Exception as e:
        print("Error creating tables:", e)

if __name__ == '__main__':
    app.run(debug=True)