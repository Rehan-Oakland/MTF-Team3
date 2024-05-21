import os
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, LoginManager, login_user, login_required, current_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from inference import extraction
import pandas as pd
# Load environment variables from .env file
load_dotenv()

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app = Flask(__name__)
cors = CORS(app)

# Set configuration from environment variables
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("SQLALCHEMY_DATABASE_URI")
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER  # Folder to store uploaded receipts
app.config['TIMEOUT'] = 60000

# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize database and login manager
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Set secure session cookie settings
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax'
)

# Define custom unauthorized handler
@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"message": "Unauthorized access"}), 401

# Define User model
class User(db.Model, UserMixin):
    __tablename__ = 'User'  # Use lowercase 'user' for consistency

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    admin = db.Column(db.Boolean, default=False, nullable=False)
    date_added = db.Column(db.DateTime, nullable=False, default=datetime.now())
    is_active = db.Column(db.Boolean(), default=True)

# Define Receipt model
class Receipt(db.Model):
    __tablename__ = 'receipt'

    id = db.Column(db.Integer, primary_key=True)
    date_added = db.Column(db.DateTime, default=datetime.now())
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)  # Reference 'user' table
    country = db.Column(db.String(50))
    project_code = db.Column(db.String(50))
    school_name = db.Column(db.String(100))
    merchant_name = db.Column(db.String(100))
    receipt_date = db.Column(db.Date)
    receipt_url = db.Column(db.String(255))
    rejected_url = db.Column(db.String(255))
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
            "status": self.status,
            "rejected_url" : self.rejected_url
        }

class Purchase(db.Model):
    __tablename__ = 'purchase'  # Explicitly specify table name

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)  # Reference 'user' table
    project_code = db.Column(db.String(50), nullable=False)
    school_name = db.Column(db.String(100), nullable=False)
    receipt_id = db.Column(db.Integer, db.ForeignKey('receipt.id'), nullable=False)
    item = db.Column(db.String(50), nullable=False)
    unit = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_cost_bdt = db.Column(db.Integer, nullable=False)
    unit_price_bdt = db.Column(db.Integer, nullable=False)
    date_purchased = db.Column(db.Date, nullable=False, default=datetime.now())

    def __repr__(self):
        return f'<Purchase {self.id}>'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/', methods=['GET'])
def home():
    return jsonify({'data': "hello world"})

@app.route('/users')
@login_required
def get_users():
    users = User.query.all()
    return jsonify([{'id': user.id, 'username': user.username, 'email': user.username} for user in users])

@app.route('/register', methods=['POST'])
def register():
    try:
        json_data = request.get_json()
        print("Received registration data:", json_data)
        
        if not json_data or not 'email' in json_data or not 'password' in json_data:
            return jsonify({"message": "Missing required fields"}), 400
        
        hashed_password = generate_password_hash(json_data['password'], method='pbkdf2:sha256')
        new_user = User(
            username=json_data['email'],
            password=hashed_password,
            admin=json_data.get('admin', False)
        )
        db.session.add(new_user)
        db.session.commit()
        print("User registered successfully:", new_user)
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print("Error during registration:", e)
        return jsonify({"message": "Error during registration"}), 500

@app.route('/login', methods=['POST'])
def login():
    json_data = request.get_json()
    print("Login data:", json_data)  # Debug statement
    user = User.query.filter_by(username=json_data['username']).first()
    if user and check_password_hash(user.password, json_data['password']):
        login_user(user)
        print("User logged in:", user.username)  # Debug statement
        return jsonify({"message": "Logged in successfully", "admin": user.admin, "email": user.username})
    print("Login failed for user:", json_data['username'])  # Debug statement
    return jsonify({"message": "Invalid username or password"}), 401

@app.route('/logout')
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"})


@app.route('/upload', methods=['POST'])
def upload():        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    filename = secure_filename(file.filename)
    cw =os.getcwd()
    filepath = os.path.join(cw, "public", "img", filename)


    file.save(filepath)

    extraction_result = extraction(filepath)
    os.chdir("public")
    relative_path = os.path.relpath(filename)

    status = extraction_result.get("validation") 
    user = User.query.filter_by(username=request.form.get('email')).first()        


    receipt_date = datetime.strptime(request.form.get('receipt_date'), "%Y-%M-%d")

    # Cut down file path so its on from /img
    # print()


    new_receipt = Receipt(
        user_id=user.id,
        country=request.form.get('country'),
        project_code=request.form.get('project_code'),
        school_name=request.form.get('school_name'),
        merchant_name=request.form.get('merchant_name'),
        receipt_date=receipt_date,
        receipt_url=relative_path,
        status=status,
        reason=extraction_result.get("reason"),
        rejected_url = extraction_result.get("file")
    )
    db.session.add(new_receipt)
    db.session.commit()


    if status == "Accepted":
        df = extraction_result.get("purchase_df")
        # Add each row to the database
        for _, row in df.iterrows():
            new_purchase = Purchase(
                user_id=user.id,  # Replace with appropriate user_id
                project_code=request.form.get('project_code'),  # Replace with appropriate project_code
                school_name=request.form.get('school_name'),  # Replace with appropriate school_name
                receipt_id=new_receipt.id,  # Replace with appropriate receipt_id
                item=row['item'],
                unit=row['unit'],
                quantity=row['quantity'],
                total_cost_bdt=row['amount'],
                unit_price_bdt=row['price'],
                date_purchased=receipt_date # Replace with appropriate date if necessary
            )
            db.session.add(new_purchase)

        # Commit the session to save the records
        db.session.commit()
        return jsonify({"message": "Receipt uploaded and validated succesfully"}), 200
    return jsonify({"message": "failed to validate receipt please check in rejected receipts to see why"}), 200

    


@app.route('/get_rejected_receipts', methods=['GET'])
def get_rejected_receipts():
    rejected_receipts = Receipt.query.filter_by(status='Rejected').all()
    return jsonify([receipt.to_dict() for receipt in rejected_receipts])

@app.route("/update_receipt_status", methods=["POST"])
def update_receipt_status():
    data = request.get_json()
    
    receipt_id = data.get('id')
    status = data.get('status')
    reason = data.get('reason')
    email = data.get('email')

    if not all([receipt_id, status, reason, email]):
        return jsonify({'error': 'Missing required data'}), 400

    user = User.query.filter_by(username=email).first()
    receipt = Receipt.query.get(receipt_id)
    if not receipt:
        return jsonify({'error': f'Receipt with ID {receipt_id} not found'}), 404

    receipt.status = status
    receipt.reason = reason
    receipt.user_id = user.id

    try:
        db.session.commit()
    except Exception as e:
        return jsonify({'error': 'Failed to update receipt'}), 500

    return jsonify({'message': f'Receipt {receipt_id} {status}ed'}), 200

@app.route('/purchases', methods=['GET'])
def get_purchases():
    school = request.args.get('school')
    item = request.args.get('item')

    query = Purchase.query

    if school:
        query = query.filter(Purchase.school_name == school)
    
    if item:
        query = query.filter(Purchase.item == item)

    purchases = query.all()

    return jsonify([{
        'id': p.id,
        'user_id': p.user_id,
        'project_code': p.project_code,
        'school_name': p.school_name,
        'receipt_id': p.receipt_id,
        'item': p.item,
        'unit': p.unit,
        'quantity': p.quantity,
        'total_cost_bdt': p.total_cost_bdt,
        'date_purchased': p.date_purchased.isoformat()
    } for p in purchases])

@app.route('/check_session', methods=['GET'])
@login_required
def check_session():
    print("Session check for user:", current_user.username)  # Debug statement
    return jsonify({"message": f"User {current_user.username} is logged in"})

@app.route('/receipts', methods=['GET'])
def get_receipts():
    receipts = Receipt.query.filter_by(user_id=current_user.id).all()
    return jsonify([receipt.to_dict() for receipt in receipts])

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

