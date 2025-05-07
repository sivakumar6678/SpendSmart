from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
import json
from sqlalchemy import func, extract, and_, or_
from flask_migrate import Migrate
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:CSKsiva%4066@localhost/spendsmart'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Change this to a random secret key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)  # Set the expiration time for JWT tokens
db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
app.config['UPLOAD_FOLDER'] = 'static/uploads/'  # Directory to save uploaded images
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit upload size to 16MB
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
    account_balance = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    transactions = db.relationship('Transaction', backref='user', lazy='dynamic')
    incomes = db.relationship('Income', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'


# Transaction Model
class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, default=lambda: datetime.now(timezone.utc), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    notes = db.Column(db.String(255), nullable=True)
    other_source = db.Column(db.String(100), nullable=True)

    def __repr__(self):
        return f'<Transactions {self.category} - {self.amount}>'


# Income Model
class Income(db.Model):
    __tablename__ = 'incomes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    source = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, default=datetime.utcnow, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    notes = db.Column(db.String(255), nullable=True)
    other_source = db.Column(db.String(100), nullable=True)

    def __repr__(self):
        return f'<Incomes {self.source} - {self.amount}>'


    
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

        # Set JWT token expiration time
        

# Login end point
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    user = User.query.filter_by(email=email).first()
    
    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))  # Create a JWT token
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

    # Fetch the user from the database
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Get the current month and year
    current_month = datetime.now().month
    current_year = datetime.now().year

    # Calculate total monthly income
    total_monthly_income = db.session.query(db.func.sum(Income.amount)).filter(
        Income.user_id == user.id,
        db.extract('month', Income.date) == current_month,
        db.extract('year', Income.date) == current_year
    ).scalar() or 0.0

    # Calculate total monthly expenses
    total_monthly_expenses = db.session.query(db.func.sum(Transaction.amount)).filter(
        Transaction.user_id == user.id,
        db.extract('month', Transaction.date) == current_month,
        db.extract('year', Transaction.date) == current_year
    ).scalar() or 0.0

    # Get the recent transactions (last 5)
    recent_transactions = [
        {"category": transaction.category, "amount": transaction.amount}
        for transaction in user.transactions.order_by(Transaction.date.desc()).limit(5).all()
    ]

    # Prepare the response data
    user_data = {
        "fullName": user.full_name,
        "email": user.email,
        "gender": user.gender,
        "profilePic": user.profile_pic,
        "qualifications": user.qualifications,
        "accountBalance": total_monthly_income - total_monthly_expenses,
        "createdAt": user.created_at,
        "recentTransactions": recent_transactions,
        "totalMonthlyIncome": total_monthly_income,
        "totalMonthlyExpenses": total_monthly_expenses
    }

    return jsonify(user_data)
    
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
@jwt_required()  # Protect this route with JWT
def add_income():
    user_id = get_jwt_identity()  # Get user ID from JWT token

    data = request.get_json()

    # Validate the input
    if not data.get('source') or not data.get('amount') or not data.get('date'):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        amount = float(data['amount'])
        date_received = datetime.strptime(data['date'], '%Y-%m-%d').date()

        # Create a new income entry and associate it with the user_id
        income_entry = Income(
            user_id=user_id,  # Use the user_id from the JWT token
            source=data['source'],
            amount=amount,
            date=date_received,
            payment_method=data.get('paymentMethod', 'Bank Transfer'),
            notes=data.get('notes', ''),
            other_source=data.get('otherSource', '')
        )

        # Add the income entry to the database and commit the transaction
        db.session.add(income_entry)
        db.session.commit()

        # Return success response with the added income data
        return jsonify({'message': 'Income added successfully!', 'data': data}), 200

    except Exception as e:
        # If there is any error, rollback and return an error message
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
# Endpoint to get the user's income data (total income and recent income)

@app.route('/api/get-user-income', methods=['GET'])
@jwt_required()
def get_user_income():
    user_id = get_jwt_identity()  # Retrieve the user ID from the JWT token

    try:
        # Calculate total monthly income
        today = datetime.today()
        first_day_of_month = today.replace(day=1)
        
        total_income = db.session.query(db.func.sum(Income.amount)).filter(
            Income.user_id == user_id,
            Income.date >= first_day_of_month
        ).scalar() or 0.0  # Default to 0.0 if no income for the month

        # Get recent income entries (limit to 5)
        recent_income = Income.query.filter(Income.user_id == user_id).order_by(Income.date.desc()).limit(5).all()

        # Prepare the response data
        recent_income_data = [{
            'source': income.source,
            'amount': income.amount,
            'date': income.date.strftime('%Y-%m-%d'),
            'paymentMethod': income.payment_method,
            'notes': income.notes,
            'otherSource': income.other_source
        } for income in recent_income]

        return jsonify({
            'totalMonthlyIncome': total_income,
            'recentIncome': recent_income_data
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/add-expense', methods=['POST'])
@jwt_required()  # Protect this route with JWT
def add_expense():
    user_id = get_jwt_identity()  # Extract user ID from the JWT token

    data = request.get_json()

    # Validate the input
    if not data.get('category') or not data.get('amount') or not data.get('date') or not data.get('paymentMethod'):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        amount = float(data['amount'])
        date_spent = datetime.strptime(data['date'], '%Y-%m-%d').date()

        # Create a new expense entry associated with the authenticated user
        expense_entry = Transaction(
            user_id=user_id,  # Use the user_id from the JWT token
            category=data['category'],
            amount=amount,
            date=date_spent,
            payment_method=data['paymentMethod'],
            notes=data.get('notes', ''),
            other_source=data.get('otherSource', '')
        )

        # Add the expense entry to the database and commit the transaction
        db.session.add(expense_entry)
        db.session.commit()

        # Return success response with the added expense data
        return jsonify({'message': 'Expense added successfully!', 'data': data}), 200

    except Exception as e:
        # If there's an error, rollback and return an error message
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Endpoint to get the user's expense data (total expenses and recent expenses)
@app.route('/api/get-user-expenses', methods=['GET'])
@jwt_required()
def get_user_expenses():
    user_id = get_jwt_identity()  # Retrieve the user ID from the JWT token

    try:
        # Calculate total monthly expenses
        today = datetime.today()
        first_day_of_month = today.replace(day=1)
        
        total_expenses = db.session.query(db.func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.date >= first_day_of_month
        ).scalar() or 0.0  # Default to 0.0 if no expenses for the month

        # Get recent expense entries (limit to 5)
        recent_expenses = Transaction.query.filter(
            Transaction.user_id == user_id
        ).order_by(Transaction.date.desc()).limit(5).all()

        # Prepare the response data
        recent_expense_data = [{
            'category': expense.category,
            'amount': expense.amount,
            'paymentMethod': expense.payment_method,
            'notes': expense.notes,
            'otherSource': expense.other_source,
            'date': expense.date.strftime('%Y-%m-%d')
        } for expense in recent_expenses]

        return jsonify({
            'totalMonthlyExpenses': total_expenses,
            'recentExpenses': recent_expense_data
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
