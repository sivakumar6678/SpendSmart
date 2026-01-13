from datetime import datetime, timezone, timedelta
import uuid
from extensions import db, bcrypt

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


# Transaction Model (Note: Handles Expenses)
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
