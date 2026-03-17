from flask import Blueprint, jsonify, request, abort, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from collections import defaultdict
import os
from extensions import db, bcrypt
from models import User, Transaction, Income, PasswordResetToken, Budget, SavingGoal, Notification, Achievement

api_bp = Blueprint('api', __name__)

# Login end point
@api_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    user = User.query.filter_by(email=email).first()
    
    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))  # Create a JWT token
        return jsonify({"message": "Login successful", "token": access_token}), 200
    return jsonify({"error": "Invalid email or password"}), 401


@api_bp.route('/signup', methods=['POST'])
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


@api_bp.route('/reset-password', methods=['POST'])
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


@api_bp.route('/user-data', methods=['GET'])
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

    # Calculate all-time income and expenses for accurate balance
    total_income = db.session.query(db.func.sum(Income.amount)).filter(
        Income.user_id == user.id
    ).scalar() or 0.0

    total_expenses = db.session.query(db.func.sum(Transaction.amount)).filter(
        Transaction.user_id == user.id
    ).scalar() or 0.0

    # Also calculate monthly for reference
    total_monthly_income = db.session.query(db.func.sum(Income.amount)).filter(
        Income.user_id == user.id,
        db.extract('month', Income.date) == current_month,
        db.extract('year', Income.date) == current_year
    ).scalar() or 0.0

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
        "accountBalance": total_income - total_expenses,
        "totalIncome": total_income,
        "totalExpenses": total_expenses,
        "createdAt": user.created_at,
        "recentTransactions": recent_transactions,
        "totalMonthlyIncome": total_monthly_income,
        "totalMonthlyExpenses": total_monthly_expenses
    }

    return jsonify(user_data)
    
@api_bp.route('/update-profile', methods=['POST'])
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
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
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


@api_bp.route('/add-income', methods=['POST'])
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
@api_bp.route('/get-user-income', methods=['GET'])
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

        # Calculate all-time total income
        all_time_income = db.session.query(db.func.sum(Income.amount)).filter(
            Income.user_id == user_id
        ).scalar() or 0.0

        # Get all income entries
        recent_income = Income.query.filter(Income.user_id == user_id).order_by(Income.date.desc()).all()

        # Prepare the response data
        recent_income_data = [{
            'id': income.id,
            'source': income.source,
            'amount': income.amount,
            'date': income.date.strftime('%Y-%m-%d'),
            'paymentMethod': income.payment_method,
            'notes': income.notes,
            'otherSource': income.other_source
        } for income in recent_income]

        return jsonify({
            'totalMonthlyIncome': total_income,
            'totalIncome': all_time_income,
            'recentIncome': recent_income_data
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/add-expense', methods=['POST'])
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
@api_bp.route('/get-user-expenses', methods=['GET'])
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

        # Calculate all-time total expenses
        all_time_expenses = db.session.query(db.func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id
        ).scalar() or 0.0

        # Get all expense entries
        recent_expenses = Transaction.query.filter(
            Transaction.user_id == user_id
        ).order_by(Transaction.date.desc()).all()

        # Prepare the response data
        recent_expense_data = [{
            'id': expense.id,
            'category': expense.category,
            'amount': expense.amount,
            'paymentMethod': expense.payment_method,
            'notes': expense.notes,
            'otherSource': expense.other_source,
            'date': expense.date.strftime('%Y-%m-%d')
        } for expense in recent_expenses]

        return jsonify({
            'totalMonthlyExpenses': total_expenses,
            'totalExpenses': all_time_expenses,
            'recentExpenses': recent_expense_data
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =============================================
# BUDGET ROUTES
# =============================================

def create_notification(user_id, message, notification_type='info'):
    """Helper to create a notification."""
    notification = Notification(
        user_id=user_id,
        message=message,
        type=notification_type
    )
    db.session.add(notification)
    db.session.commit()


@api_bp.route('/budgets', methods=['GET'])
@jwt_required()
def get_budgets():
    user_id = get_jwt_identity()
    budgets = Budget.query.filter_by(user_id=user_id).all()
    return jsonify({
        'budgets': [{
            'id': b.id,
            'category': b.category or '',
            'amount': b.amount,
            'month': b.month,
            'year': b.year
        } for b in budgets]
    }), 200


@api_bp.route('/budgets', methods=['POST'])
@jwt_required()
def add_budget():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('amount'):
        return jsonify({'error': 'Amount is required'}), 400

    try:
        budget = Budget(
            user_id=user_id,
            category=data.get('category', ''),
            amount=float(data['amount']),
            month=data.get('month', datetime.now().month),
            year=data.get('year', datetime.now().year)
        )
        db.session.add(budget)
        db.session.commit()

        create_notification(user_id, f"Budget created: ₹{budget.amount} for {budget.category or 'Total'}", 'budget_created')

        return jsonify({
            'id': budget.id,
            'category': budget.category or '',
            'amount': budget.amount,
            'month': budget.month,
            'year': budget.year
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/budgets/<int:budget_id>', methods=['PUT'])
@jwt_required()
def update_budget(budget_id):
    user_id = get_jwt_identity()
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()

    if not budget:
        return jsonify({'error': 'Budget not found'}), 404

    data = request.get_json()
    try:
        budget.category = data.get('category', budget.category)
        budget.amount = float(data.get('amount', budget.amount))
        budget.month = data.get('month', budget.month)
        budget.year = data.get('year', budget.year)
        db.session.commit()

        return jsonify({
            'id': budget.id,
            'category': budget.category or '',
            'amount': budget.amount,
            'month': budget.month,
            'year': budget.year
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/budgets/<int:budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    user_id = get_jwt_identity()
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()

    if not budget:
        return jsonify({'error': 'Budget not found'}), 404

    try:
        db.session.delete(budget)
        db.session.commit()
        return jsonify({'message': 'Budget deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/budget-analysis', methods=['GET'])
@jwt_required()
def budget_analysis():
    user_id = get_jwt_identity()
    current_month = datetime.now().month
    current_year = datetime.now().year

    budgets = Budget.query.filter_by(
        user_id=user_id, month=current_month, year=current_year
    ).all()

    analysis = []
    for budget in budgets:
        # Calculate spending for this category
        query = db.session.query(db.func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            db.extract('month', Transaction.date) == current_month,
            db.extract('year', Transaction.date) == current_year
        )
        if budget.category:
            query = query.filter(Transaction.category == budget.category)

        spent = query.scalar() or 0.0
        remaining = budget.amount - spent
        percentage = (spent / budget.amount * 100) if budget.amount > 0 else 0

        analysis.append({
            'category': budget.category or 'Total',
            'budgeted': budget.amount,
            'spent': spent,
            'remaining': remaining,
            'percentage': round(percentage, 1)
        })

        # Auto-generate budget warning notifications
        if percentage >= 90 and percentage < 100:
            create_notification(
                user_id,
                f"⚠️ You've used {percentage:.0f}% of your {budget.category or 'total'} budget!",
                'budget_warning'
            )
        elif percentage >= 100:
            create_notification(
                user_id,
                f"🚨 Budget exceeded! You've spent ₹{spent:.2f} against ₹{budget.amount:.2f} {budget.category or 'total'} budget.",
                'budget_exceeded'
            )

    return jsonify({'budget_analysis': analysis}), 200


# =============================================
# SAVING GOALS ROUTES
# =============================================

@api_bp.route('/saving-goals', methods=['GET'])
@jwt_required()
def get_saving_goals():
    user_id = get_jwt_identity()
    goals = SavingGoal.query.filter_by(user_id=user_id).order_by(SavingGoal.created_at.desc()).all()
    return jsonify({
        'saving_goals': [{
            'id': g.id,
            'title': g.title,
            'target_amount': g.target_amount,
            'current_amount': g.current_amount,
            'target_date': g.target_date.strftime('%Y-%m-%d'),
            'completed': g.completed
        } for g in goals]
    }), 200


@api_bp.route('/saving-goals', methods=['POST'])
@jwt_required()
def add_saving_goal():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('title') or not data.get('target_amount') or not data.get('target_date'):
        return jsonify({'error': 'Title, target amount, and target date are required'}), 400

    try:
        goal = SavingGoal(
            user_id=user_id,
            title=data['title'],
            target_amount=float(data['target_amount']),
            current_amount=float(data.get('current_amount', 0)),
            target_date=datetime.strptime(data['target_date'], '%Y-%m-%d').date(),
            completed=False
        )
        db.session.add(goal)
        db.session.commit()

        create_notification(user_id, f"🎯 New saving goal created: {goal.title} - ₹{goal.target_amount}", 'goal_created')

        return jsonify({
            'id': goal.id,
            'title': goal.title,
            'target_amount': goal.target_amount,
            'current_amount': goal.current_amount,
            'target_date': goal.target_date.strftime('%Y-%m-%d'),
            'completed': goal.completed
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/saving-goals/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_saving_goal(goal_id):
    user_id = get_jwt_identity()
    goal = SavingGoal.query.filter_by(id=goal_id, user_id=user_id).first()

    if not goal:
        return jsonify({'error': 'Saving goal not found'}), 404

    data = request.get_json()
    try:
        goal.title = data.get('title', goal.title)
        goal.target_amount = float(data.get('target_amount', goal.target_amount))
        goal.current_amount = float(data.get('current_amount', goal.current_amount))
        if data.get('target_date'):
            goal.target_date = datetime.strptime(data['target_date'], '%Y-%m-%d').date()

        # Auto-mark as completed if current >= target
        if goal.current_amount >= goal.target_amount:
            if not goal.completed:
                goal.completed = True
                create_notification(user_id, f"🎉 Congratulations! You've reached your saving goal: {goal.title}!", 'goal_completed')

        db.session.commit()

        return jsonify({
            'id': goal.id,
            'title': goal.title,
            'target_amount': goal.target_amount,
            'current_amount': goal.current_amount,
            'target_date': goal.target_date.strftime('%Y-%m-%d'),
            'completed': goal.completed
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/saving-goals/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_saving_goal(goal_id):
    user_id = get_jwt_identity()
    goal = SavingGoal.query.filter_by(id=goal_id, user_id=user_id).first()

    if not goal:
        return jsonify({'error': 'Saving goal not found'}), 404

    try:
        db.session.delete(goal)
        db.session.commit()
        return jsonify({'message': 'Saving goal deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# =============================================
# NOTIFICATION ROUTES
# =============================================

@api_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=user_id).order_by(
        Notification.created_at.desc()
    ).limit(50).all()

    return jsonify({
        'notifications': [{
            'id': n.id,
            'message': n.message,
            'type': n.type,
            'read': n.read,
            'created_at': n.created_at.isoformat()
        } for n in notifications]
    }), 200


@api_bp.route('/notifications/mark-read', methods=['POST'])
@jwt_required()
def mark_notifications_read():
    user_id = get_jwt_identity()
    data = request.get_json()
    notification_ids = data.get('notification_ids', [])

    try:
        if notification_ids:
            Notification.query.filter(
                Notification.id.in_(notification_ids),
                Notification.user_id == user_id
            ).update({Notification.read: True}, synchronize_session='fetch')
        else:
            # Mark all as read
            Notification.query.filter_by(
                user_id=user_id, read=False
            ).update({Notification.read: True}, synchronize_session='fetch')

        db.session.commit()
        return jsonify({'message': 'Notifications marked as read'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# =============================================
# ACHIEVEMENT ROUTES
# =============================================

@api_bp.route('/achievements', methods=['GET'])
@jwt_required()
def get_achievements():
    user_id = get_jwt_identity()

    # Auto-check and award achievements
    _check_and_award_achievements(user_id)

    achievements = Achievement.query.filter_by(user_id=user_id).order_by(
        Achievement.date_earned.desc()
    ).all()

    return jsonify({
        'achievements': [{
            'id': a.id,
            'title': a.title,
            'description': a.description,
            'badge_type': a.badge_type,
            'date_earned': a.date_earned.isoformat()
        } for a in achievements]
    }), 200


def _check_and_award_achievements(user_id):
    """Check and award new achievements based on user activity."""
    existing_badges = {a.badge_type for a in Achievement.query.filter_by(user_id=user_id).all()}

    current_month = datetime.now().month
    current_year = datetime.now().year

    # 1. Budget Master - stayed under budget for current month
    if 'budget_master' not in existing_badges:
        budgets = Budget.query.filter_by(user_id=user_id, month=current_month, year=current_year).all()
        if budgets:
            all_under = True
            for budget in budgets:
                query = db.session.query(db.func.sum(Transaction.amount)).filter(
                    Transaction.user_id == user_id,
                    db.extract('month', Transaction.date) == current_month,
                    db.extract('year', Transaction.date) == current_year
                )
                if budget.category:
                    query = query.filter(Transaction.category == budget.category)
                spent = query.scalar() or 0.0
                if spent > budget.amount:
                    all_under = False
                    break
            if all_under:
                _award_achievement(user_id, 'budget_master', 'Budget Master',
                                   'Stayed within all budgets for a full month!')

    # 2. Saving Goal Achieved
    if 'saving_goal_achieved' not in existing_badges:
        completed_goals = SavingGoal.query.filter_by(user_id=user_id, completed=True).count()
        if completed_goals > 0:
            _award_achievement(user_id, 'saving_goal_achieved', 'Goal Achiever',
                               'Completed your first saving goal!')

    # 3. Perfect Month - income > expenses
    if 'perfect_month' not in existing_badges:
        total_income = db.session.query(db.func.sum(Income.amount)).filter(
            Income.user_id == user_id,
            db.extract('month', Income.date) == current_month,
            db.extract('year', Income.date) == current_year
        ).scalar() or 0.0

        total_expenses = db.session.query(db.func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            db.extract('month', Transaction.date) == current_month,
            db.extract('year', Transaction.date) == current_year
        ).scalar() or 0.0

        if total_income > 0 and total_income > total_expenses:
            _award_achievement(user_id, 'perfect_month', 'Perfect Month',
                               'Your income exceeded your expenses this month!')

    # 4. Streak Master - 7+ transactions in last 7 days
    if 'streak_master' not in existing_badges:
        seven_days_ago = datetime.now().date() - timedelta(days=7)
        distinct_days = db.session.query(db.func.count(db.distinct(Transaction.date))).filter(
            Transaction.user_id == user_id,
            Transaction.date >= seven_days_ago
        ).scalar() or 0
        if distinct_days >= 7:
            _award_achievement(user_id, 'streak_master', 'Streak Master',
                               'Logged transactions for 7 consecutive days!')


def _award_achievement(user_id, badge_type, title, description):
    """Award an achievement and create a notification."""
    achievement = Achievement(
        user_id=user_id,
        title=title,
        description=description,
        badge_type=badge_type
    )
    db.session.add(achievement)
    db.session.commit()
    create_notification(user_id, f"🏆 Achievement unlocked: {title}!", 'achievement')


# =============================================
# FINANCIAL INSIGHTS ROUTES
# =============================================

@api_bp.route('/financial-insights', methods=['GET'])
@jwt_required()
def get_financial_insights():
    user_id = get_jwt_identity()
    insights = []

    current_month = datetime.now().month
    current_year = datetime.now().year

    # Calculate totals
    total_income = db.session.query(db.func.sum(Income.amount)).filter(
        Income.user_id == user_id,
        db.extract('month', Income.date) == current_month,
        db.extract('year', Income.date) == current_year
    ).scalar() or 0.0

    total_expenses = db.session.query(db.func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        db.extract('month', Transaction.date) == current_month,
        db.extract('year', Transaction.date) == current_year
    ).scalar() or 0.0

    # 1. Savings rate
    if total_income > 0:
        savings_rate = ((total_income - total_expenses) / total_income) * 100
        if savings_rate >= 20:
            insights.append({
                'type': 'positive',
                'title': 'Great Savings Rate!',
                'description': f'You\'re saving {savings_rate:.1f}% of your income this month. That\'s excellent financial health!'
            })
        elif savings_rate >= 0:
            insights.append({
                'type': 'suggestion',
                'title': 'Room for Improvement',
                'description': f'Your savings rate is {savings_rate:.1f}%. Try to save at least 20% of your income for financial security.'
            })
        else:
            insights.append({
                'type': 'warning',
                'title': 'Spending Exceeds Income',
                'description': f'You\'ve spent ₹{abs(total_income - total_expenses):.2f} more than your income this month. Consider reducing expenses.'
            })

    # 2. Top expense category
    top_category = db.session.query(
        Transaction.category,
        db.func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == user_id,
        db.extract('month', Transaction.date) == current_month,
        db.extract('year', Transaction.date) == current_year
    ).group_by(Transaction.category).order_by(db.desc('total')).first()

    if top_category:
        category_percentage = (top_category.total / total_expenses * 100) if total_expenses > 0 else 0
        insights.append({
            'type': 'information',
            'title': f'Top Spending: {top_category.category}',
            'description': f'{top_category.category} is your highest expense category at ₹{top_category.total:.2f} ({category_percentage:.1f}% of total expenses).'
        })

    # 3. Monthly comparison with previous month
    prev_month = current_month - 1 if current_month > 1 else 12
    prev_year = current_year if current_month > 1 else current_year - 1

    prev_expenses = db.session.query(db.func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        db.extract('month', Transaction.date) == prev_month,
        db.extract('year', Transaction.date) == prev_year
    ).scalar() or 0.0

    if prev_expenses > 0 and total_expenses > 0:
        change = ((total_expenses - prev_expenses) / prev_expenses) * 100
        if change > 15:
            insights.append({
                'type': 'warning',
                'title': 'Spending Increased',
                'description': f'Your spending increased by {change:.1f}% compared to last month. Review your expenses to identify areas to cut back.'
            })
        elif change < -10:
            insights.append({
                'type': 'positive',
                'title': 'Spending Decreased',
                'description': f'Great job! Your spending decreased by {abs(change):.1f}% compared to last month.'
            })

    # 4. Budget adherence insight
    budgets = Budget.query.filter_by(user_id=user_id, month=current_month, year=current_year).all()
    if budgets:
        on_track = sum(1 for b in budgets if _get_budget_spent(user_id, b, current_month, current_year) <= b.amount)
        insights.append({
            'type': 'positive' if on_track == len(budgets) else 'suggestion',
            'title': 'Budget Adherence',
            'description': f'You\'re on track with {on_track} out of {len(budgets)} budgets this month.'
        })

    # 5. If no data yet
    if not insights:
        insights.append({
            'type': 'information',
            'title': 'Start Tracking',
            'description': 'Add income and expenses to get personalized financial insights and recommendations.'
        })

    return jsonify({'insights': insights}), 200


def _get_budget_spent(user_id, budget, month, year):
    query = db.session.query(db.func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        db.extract('month', Transaction.date) == month,
        db.extract('year', Transaction.date) == year
    )
    if budget.category:
        query = query.filter(Transaction.category == budget.category)
    return query.scalar() or 0.0


# =============================================
# PAYMENT METHOD ANALYSIS
# =============================================

@api_bp.route('/payment-method-analysis', methods=['GET'])
@jwt_required()
def payment_method_analysis():
    user_id = get_jwt_identity()
    current_month = datetime.now().month
    current_year = datetime.now().year

    results = db.session.query(
        Transaction.payment_method,
        db.func.sum(Transaction.amount).label('total'),
        db.func.count(Transaction.id).label('count')
    ).filter(
        Transaction.user_id == user_id,
        db.extract('month', Transaction.date) == current_month,
        db.extract('year', Transaction.date) == current_year
    ).group_by(Transaction.payment_method).all()

    total_spent = sum(r.total for r in results) if results else 0

    analysis = [{
        'method': r.payment_method,
        'total': r.total,
        'count': r.count,
        'percentage': round((r.total / total_spent * 100) if total_spent > 0 else 0, 1)
    } for r in results]

    return jsonify({'payment_method_analysis': analysis}), 200


# =============================================
# TRANSACTION UPDATE/DELETE ROUTES
# =============================================

@api_bp.route('/transactions/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    user_id = get_jwt_identity()
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()

    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404

    data = request.get_json()
    try:
        transaction.category = data.get('category', transaction.category)
        transaction.amount = float(data.get('amount', transaction.amount))
        if data.get('date'):
            transaction.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        transaction.payment_method = data.get('payment_method', transaction.payment_method)
        transaction.notes = data.get('notes', transaction.notes)
        db.session.commit()

        return jsonify({
            'id': transaction.id,
            'category': transaction.category,
            'amount': transaction.amount,
            'date': transaction.date.strftime('%Y-%m-%d'),
            'paymentMethod': transaction.payment_method,
            'notes': transaction.notes
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/transactions/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    user_id = get_jwt_identity()
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()

    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404

    try:
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({'message': 'Transaction deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/transactions/filter', methods=['GET'])
@jwt_required()
def filter_transactions():
    user_id = get_jwt_identity()

    query = Transaction.query.filter_by(user_id=user_id)

    if request.args.get('start_date'):
        query = query.filter(Transaction.date >= datetime.strptime(request.args['start_date'], '%Y-%m-%d').date())
    if request.args.get('end_date'):
        query = query.filter(Transaction.date <= datetime.strptime(request.args['end_date'], '%Y-%m-%d').date())
    if request.args.get('min_amount'):
        query = query.filter(Transaction.amount >= float(request.args['min_amount']))
    if request.args.get('max_amount'):
        query = query.filter(Transaction.amount <= float(request.args['max_amount']))
    if request.args.get('category'):
        query = query.filter(Transaction.category == request.args['category'])
    if request.args.get('payment_method'):
        query = query.filter(Transaction.payment_method == request.args['payment_method'])

    transactions = query.order_by(Transaction.date.desc()).all()

    return jsonify({
        'transactions': [{
            'id': t.id,
            'category': t.category,
            'amount': t.amount,
            'date': t.date.strftime('%Y-%m-%d'),
            'paymentMethod': t.payment_method,
            'notes': t.notes
        } for t in transactions]
    }), 200


# =============================================
# INCOME UPDATE/DELETE ROUTES
# =============================================

@api_bp.route('/incomes/<int:income_id>', methods=['PUT'])
@jwt_required()
def update_income(income_id):
    user_id = get_jwt_identity()
    income = Income.query.filter_by(id=income_id, user_id=user_id).first()

    if not income:
        return jsonify({'error': 'Income not found'}), 404

    data = request.get_json()
    try:
        income.source = data.get('source', income.source)
        income.amount = float(data.get('amount', income.amount))
        if data.get('date'):
            income.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        income.payment_method = data.get('payment_method', income.payment_method)
        income.notes = data.get('notes', income.notes)
        db.session.commit()

        return jsonify({
            'id': income.id,
            'source': income.source,
            'amount': income.amount,
            'date': income.date.strftime('%Y-%m-%d'),
            'paymentMethod': income.payment_method,
            'notes': income.notes
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/incomes/<int:income_id>', methods=['DELETE'])
@jwt_required()
def delete_income(income_id):
    user_id = get_jwt_identity()
    income = Income.query.filter_by(id=income_id, user_id=user_id).first()

    if not income:
        return jsonify({'error': 'Income not found'}), 404

    try:
        db.session.delete(income)
        db.session.commit()
        return jsonify({'message': 'Income deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api_bp.route('/incomes/filter', methods=['GET'])
@jwt_required()
def filter_incomes():
    user_id = get_jwt_identity()

    query = Income.query.filter_by(user_id=user_id)

    if request.args.get('start_date'):
        query = query.filter(Income.date >= datetime.strptime(request.args['start_date'], '%Y-%m-%d').date())
    if request.args.get('end_date'):
        query = query.filter(Income.date <= datetime.strptime(request.args['end_date'], '%Y-%m-%d').date())
    if request.args.get('min_amount'):
        query = query.filter(Income.amount >= float(request.args['min_amount']))
    if request.args.get('max_amount'):
        query = query.filter(Income.amount <= float(request.args['max_amount']))
    if request.args.get('source'):
        query = query.filter(Income.source == request.args['source'])
    if request.args.get('payment_method'):
        query = query.filter(Income.payment_method == request.args['payment_method'])

    incomes = query.order_by(Income.date.desc()).all()

    return jsonify({
        'incomes': [{
            'id': i.id,
            'source': i.source,
            'amount': i.amount,
            'date': i.date.strftime('%Y-%m-%d'),
            'paymentMethod': i.payment_method,
            'notes': i.notes
        } for i in incomes]
    }), 200
