from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, migrate, bcrypt, jwt
from routes import api_bp
# Import models so that they are registered with SQLAlchemy
from models import User, Transaction, Income, PasswordResetToken

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Register Blueprints
    app.register_blueprint(api_bp, url_prefix='/api')

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
