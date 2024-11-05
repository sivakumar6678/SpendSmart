from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta, timezone
import uuid

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:CSKsiva%4066@localhost/spendsmart'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

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
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(datetime.timezone.utc))
    expires_at = db.Column(db.DateTime, default=lambda: datetime.now(datetime.timezone.utc) + timedelta(hours=1))

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
        return jsonify({"message": "Login successful", "user": user.username}), 200
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

# Getting user data
@app.route('/api/user-data', methods=['GET'])
def get_user_data():
    user_id = 1  # Change this as necessary to get the logged-in user

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Calculate total monthly income and expenses
    total_monthly_income = sum(transaction.amount for transaction in user.transactions if transaction.type == 'income' and transaction.date.month == datetime.now().month)
    total_monthly_expenses = sum(transaction.amount for transaction in user.transactions if transaction.type == 'expense' and transaction.date.month == datetime.now().month)

    # Prepare the response data
    user_data = {
        "fullName": user.full_name,
        "accountBalance": user.account_balance,
        "recentTransactions": [
            {
                "description": transaction.description,
                "amount": transaction.amount
            } for transaction in user.transactions[-5:]  # Get last 5 transactions
        ],
        "totalMonthlyIncome": total_monthly_income,
        "recentIncome": [
            {
                "description": transaction.description,
                "amount": transaction.amount
            } for transaction in user.transactions if transaction.type == 'income' and transaction.date.month == datetime.now().month
        ][:5],  # Get last 5 income transactions
        "totalMonthlyExpenses": total_monthly_expenses,
        "recentExpenses": [
            {
                "description": transaction.description,
                "amount": transaction.amount
            } for transaction in user.transactions if transaction.type == 'expense' and transaction.date.month == datetime.now().month
        ][:5],  # Get last 5 expense transactions
    }

    return jsonify(user_data), 200

#     # Add sample transactions for testing
#     user_id = 1  # Adjust as needed
#     transactions = [
#         Transaction(user_id=user_id, description="Groceries", amount=50.00),
#         Transaction(user_id=user_id, description="Utilities", amount=100.00),
#         Transaction(user_id=user_id, description="Subscription", amount=15.99),
#         Transaction(user_id=user_id, description="Dinner", amount=45.00),
#         Transaction(user_id=user_id, description="Gas", amount=30.00)
#     ]
#     db.session.bulk_save_objects(transactions)
#     db.session.commit()


if __name__ == '__main__':
    app.run(debug=True)
