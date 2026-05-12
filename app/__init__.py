from flask import Flask
from flask_cors import CORS

from config import Config

from app.extensions import db, ma, jwt, migrate

# Blueprints
from app.tenders.controllers.tender_routes import tender_bp
from app.auth.controllers.user_routes import user_bp
from app.documents.controllers.document_routes import documents_bp
from app.bids.controllers.bid_routes import bid_bp

# Models (so SQLAlchemy registers them)
from app.tenders.models.tender import Tender
from app.auth.models.user import User
from app.bids.models.bid import Bid
from app.documents.models.document import Document
from app.notifications.models.notification import Notification

def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app)
    CORS(app)

    # Register blueprints
    app.register_blueprint(
        user_bp,
        url_prefix="/api/auth"
    )

    app.register_blueprint(
        tender_bp,
        url_prefix="/api/v1/tenders"
    )

    app.register_blueprint(
        bid_bp,
        url_prefix="/api/v1/bids"
    )

    app.register_blueprint(
        documents_bp,
        url_prefix="/api/documents"
    )
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")

    # Create tables (DEV ONLY)
    with app.app_context():
        db.create_all()

    return app