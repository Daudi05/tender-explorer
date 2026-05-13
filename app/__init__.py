"""
Flask application factory.

Initializes extensions and registers all module blueprints.
Each blueprint declares its own url_prefix (/api/auth, /api/tenders, etc.)
so we DON'T pass url_prefix here — that would double up the prefix.
"""
from flask import Flask
from config import Config
from app.extensions import db, jwt, ma, bcrypt
from app.middleware.error_middleware import register_error_handlers


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize all extensions
    db.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)
    bcrypt.init_app(app)

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

    app.register_blueprint(auth_bp)
    app.register_blueprint(tenders_bp)
    app.register_blueprint(bids_bp)
    app.register_blueprint(documents_bp)
    app.register_blueprint(notifications_bp)

    # ----- Create database tables -----
    # Importing the model classes inside app_context registers them
    # with SQLAlchemy so db.create_all() knows what tables to make.
    with app.app_context():
        from app.auth.models.user import User
        from app.tenders.models.tender import Tender
        from app.bids.models.bid import Bid
        from app.documents.models.document import Document
        from app.notifications.models.notification import Notification
        db.create_all()

    return app
