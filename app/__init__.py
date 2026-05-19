
"""
Flask application factory.

Initializes extensions and registers all module blueprints.
Each blueprint declares its own url_prefix (/api/auth, /api/tenders, etc.)
so we DON'T pass url_prefix here — that would double up the prefix.
"""
from flask import Flask
from config import Config
from app.extensions import db, jwt, ma, bcrypt, migrate
from app.middleware.error_middleware import register_error_handlers
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    # Initialize all extensions
    db.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)

    # Register global error handlers (404, 500, 405 → JSON)
    register_error_handlers(app)

    # ----- Register module blueprints -----
    # Each Blueprint file already sets its own url_prefix,
    # so we DON'T pass one here (avoids /api/v1/api/documents).
    from app.auth.controllers.user_routes import auth_bp
    from app.tenders.controllers.tender_routes import tenders_bp
    from app.bids.controllers.bid_routes import bids_bp
    from app.documents.controllers.document_routes import documents_bp
    from app.notifications.controllers.notification_routes import notifications_bp
    from app.awards.controllers.award_routes import awards_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(tenders_bp)
    app.register_blueprint(bids_bp)
    app.register_blueprint(documents_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(awards_bp)

    with app.app_context():
        from app.auth.models.user import User
        from app.tenders.models.tender import Tender
        from app.bids.models.bid import Bid
        from app.documents.models.document import Document
        from app.notifications.models.notification import Notification
        from app.awards.models.award import Award
        db.create_all()
from flask import Flask
from app.extensions import db, ma, jwt, migrate
from app.middleware.error_middleware import register_error_handlers
import os

def create_app():
    app = Flask(__name__)
    
    # Configurations
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/tender_db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'group6-secret-key')

    # Initializing  Extensions
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Register Global Error Handlings here later 
    register_error_handlers(app)

    # To be filled later here for the blueprints 
    # app.register_blueprint(auth_bp)
    # app.register_blueprint(tender_bp)

    return app
