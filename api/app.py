import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, LoginManager, login_user, login_required, current_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime  # Import datetime for date/time handling



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


@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(int(user_id))

@app.route('/', methods=['GET', 'POST'])
def home():
    return jsonify({'data': "hello world"})

  
# Define User model
class User(db.Model):
    __tablename__ = 'User'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    admin = db.Column(db.Boolean, default=False, nullable=False)  # Added is_admin field
    date_added = db.Column(db.DateTime, nullable=False, default=datetime.now())  # Added date_added field
    
class Receipt(db.Model):
    __tablename__ = 'receipt'

    id = db.Column(db.Integer, primary_key=True)
    date_added = db.Column(db.DateTime, default=datetime.now())
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)  # Foreign key to User model
    country = db.Column(db.String(50))
    project_code = db.Column(db.String(50))
    school_name = db.Column(db.String(100))
    merchant_name = db.Column(db.String(100))
    receipt_date = db.Column(db.Date)
    receipt_url = db.Column(db.String(255))
    status = db.Column(db.String(20), default='Pending', nullable=False)
    reason = db.Column(db.Text, nullable=True)

    user = db.relationship('User', backref='receipts')  

    def __repr__(self):
        return f"<Receipt(id={self.id}, user_id={self.user_id}, status={self.status})>"
    
    def to_dict(self):
        return {
        "id": self.id,
        "user_id": self.user_id,
        "country": self.country,
        "project_code": self.project_code,
        "merchant_name": self.merchant_name,
        "school_name": self.school_name,
        "reason": self.reason,
        "receipt_url": self.receipt_url,
        "receipt_date": self.receipt_date,
        # ... other relevant receipt properties
        "status": self.status,
        }
    
@app.route('/', methods = ['GET', 'POST']) 
def home(): 
    if(request.method == 'GET'): 
  
        data = "hello world"
        return jsonify({'data': data}) 

@app.route('/users')
@login_required
def get_users():
    users = User.query.all()
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
      
 @app.route('/get_rejected_receipts', methods=['GET'])
 def get_rejected_receipts():
    rejected_receipts = Receipt.query.filter_by(status='Rejected').all()

    return jsonify([receipt.to_dict() for receipt in rejected_receipts])
 
@app.route("/update_receipt_status" , methods = ["POST"])
def update_receipt_status():
    data =request.get_json()
    email = data.get("email")
      # Extract required information
    receipt_id = data.get('id')
    status = data.get('status')
    reason = data.get('reason')
    email = data.get('email')

    # Error handling (check for missing data)
    if not all([receipt_id, status, reason, email]):
        return jsonify({'error': 'Missing required data'}), 400


        # Find the receipt by ID
    user = User.query.filter_by(username=email).first()

    receipt = Receipt.query.get(receipt_id)
    if not receipt:
        return jsonify({'error': f'Receipt with ID {receipt_id} not found'}), 404

    # Update receipt status and reason
    receipt.status = status
    receipt.reason = reason
    receipt.user_id = user.id

    # Commit changes to the database
    try:
        db.session.commit()
    except Exception as e:
        # Handle database errors gracefully (log or return specific error message)
        return jsonify({'error': 'Failed to update receipt'}), 500

    # Send success response
    return jsonify({'message': f'Receipt {receipt_id} {status}ed'}), 200

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
