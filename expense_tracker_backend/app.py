from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:CSKsiva%4066@localhost/spendsmart'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Change this to a random secret key
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
app.config['UPLOAD_FOLDER'] = 'static/uploads/'  # Directory to save uploaded images
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit upload size to 16MB

# User Model
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    qualifications = db.Column(db.Text, nullable=True)
    gender = db.Column(db.String(10), nullable=True)
    profile_pic = db.Column(db.String(255), nullable=True)
    account_balance = db.Column(db.Float, default=0.0)  # Add account balance field
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(10), nullable=False)  # 'income' or 'expense'
    date = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    
    user = db.relationship('User', backref=db.backref('transactions', lazy=True))

    def __repr__(self):
        return f'<Transaction {self.description}: {self.amount} ({self.type})>'

# Define the Income model
class Income(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)  # New field to associate with user
    source = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    notes = db.Column(db.String(255))
    other_source = db.Column(db.String(100))

# Initialize the database and create tables
with app.app_context():
    db.create_all()


    
# Password Reset Token Model
class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('reset_tokens', lazy=True))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc) + timedelta(hours=1))

    def is_valid(self):
        return datetime.now(datetime.timezone.utc) < self.expires_at

    def __repr__(self):
        return f'<PasswordResetToken for User ID {self.user_id}>'



# Login end point
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    user = User.query.filter_by(email=email).first()
    
    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)  # Create a JWT token
        return jsonify({"message": "Login successful", "token": access_token}), 200
    return jsonify({"error": "Invalid email or password"}), 401


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    username = data.get("username")
    full_name = data.get("fullName")
    email = data.get("email")
    password = data.get("password")

    # Validate required fields
    if not (username and full_name and email and password):
        return jsonify({"error": "All fields are required"}), 400

    # Check if username or email already exists
    existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
    if existing_user:
        return jsonify({"error": "Username or email already exists"}), 400

    # Attempt to create the user
    try:
        new_user = User(username=username, full_name=full_name, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()  # Rollback the session on error
        print(f"Error occurred: {str(e)}")  # Log the error for debugging
        return jsonify({"error": "An error occurred during user registration", "details": repr(e)}), 500

    return jsonify({"message": "Signup successful"}), 201



@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    new_password = data.get("newPassword")
    confirm_new_password = data.get("confirmNewPassword")

    if not (email and new_password and confirm_new_password):
        return jsonify({"error": "All fields are required"}), 400

    if new_password != confirm_new_password:
        return jsonify({"error": "Passwords do not match"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        user.set_password(new_password)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred while resetting the password", "details": str(e)}), 500

    return jsonify({"message": "Password reset successful"}), 200

@app.route('/api/user-data', methods=['GET'])
@jwt_required()
def get_user_data():
    user_id = get_jwt_identity()  # Retrieve the user ID from the JWT token

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Calculate total monthly income and expenses
    total_monthly_income = sum(
        transaction.amount for transaction in user.transactions
        if transaction.type == 'income' and transaction.date.month == datetime.now().month
    )
    total_monthly_expenses = sum(
        transaction.amount for transaction in user.transactions
        if transaction.type == 'expense' and transaction.date.month == datetime.now().month
    )

    # Prepare the response data
    user_data = {
        "fullName": user.full_name,
        "email": user.email,
        "gender": user.gender,
        "profilePic": user.profile_pic,
        "qualifications": user.qualifications,
        "accountBalance": user.account_balance,
        "createdAt": user.created_at,
        "recentTransactions": [
            {"description": transaction.description, "amount": transaction.amount}
            for transaction in user.transactions[-5:]  # Get last 5 transactions
        ],
        "totalMonthlyIncome": total_monthly_income,
        "recentIncome": [
            {"description": transaction.description, "amount": transaction.amount}
            for transaction in user.transactions if transaction.type == 'income' and transaction.date.month == datetime.now().month
        ][:5],  # Get last 5 income transactions
        "totalMonthlyExpenses": total_monthly_expenses,
        "recentExpenses": [
            {"description": transaction.description, "amount": transaction.amount}
            for transaction in user.transactions if transaction.type == 'expense' and transaction.date.month == datetime.now().month
        ][:5],  # Get last 5 expense transactions
    }

    return jsonify(user_data), 200

@app.route('/api/update-profile', methods=['POST'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()  # Get user ID from JWT token

    # Fetch the user from the database
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Get form data
    user.full_name = request.form.get('fullName', user.full_name)
    user.email = request.form.get('email', user.email)
    user.gender = request.form.get('gender', user.gender)

    # Process and save the profile image
    if 'profileImage' in request.files:
        file = request.files['profileImage']
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            user.profile_pic = file_path

    # Save changes to the database
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred while updating the profile", "details": str(e)}), 500

    # Return the updated user data
    return jsonify({
        "id": user.id,
        "fullName": user.full_name,
        "email": user.email,
        "gender": user.gender,
        "profilePic": user.profile_pic,  # Note: Match frontend field names
        "createdAt": user.created_at
    }), 200

@app.route('/api/add-income', methods=['POST'])
def add_income():
    data = request.get_json()

    # Validate the input
    if not data.get('userId') or not data.get('source') or not data.get('amount') or not data.get('date'):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Ensure that the user_id is passed
        user_id = data['userId']
        amount = float(data['amount'])
        date_received = datetime.strptime(data['date'], '%Y-%m-%d').date()

        income_entry = Income(
            user_id=user_id,  # Store the user_id
            source=data['source'],
            amount=amount,
            date=date_received,
            payment_method=data.get('paymentMethod', 'Bank Transfer'),
            notes=data.get('notes', ''),
            other_source=data.get('otherSource', '')
        )

        db.session.add(income_entry)
        db.session.commit()

        return jsonify({'message': 'Income added successfully!', 'data': data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
# Endpoint to get the user's income data (total income and recent income)
@app.route('/api/get-user-income/<int:user_id>', methods=['GET'])
def get_user_income(user_id):
    try:
        # Calculate total monthly income
        today = datetime.today()
        first_day_of_month = today.replace(day=1)
        total_income = db.session.query(db.func.sum(Income.amount)).filter(
            Income.user_id == user_id,
            Income.date >= first_day_of_month
        ).scalar() or 0.0
        
        # Get recent income entries (limit to 5)
        recent_income = Income.query.filter(Income.user_id == user_id).order_by(Income.date.desc()).limit(5).all()

        # Prepare data to send back
        recent_income_data = [{
            'description': income.source,
            'amount': income.amount,
            'date': income.date.strftime('%Y-%m-%d')
        } for income in recent_income]

        return jsonify({
            'totalMonthlyIncome': total_income,
            'recentIncome': recent_income_data
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True)
