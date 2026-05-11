
from flask import Flask
from flask_cors import CORS

from config import Config

from app.extensions import db, ma, jwt, migrate

from app.tenders.controllers.tender_routes import tender_bp
from app.auth.controllers.user_routes import user_bp
from app.documents.controllers.document_routes import documents_bp

# Import models so SQLAlchemy detects them
from app.tenders.models.tender import Tender
from app.auth.models.user import User
from app.bids.models.bid import Bid
from app.documents.models.document import Document


def create_app():
    app = Flask(__name__)

    # Load config
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app)

    # Enable CORS
    CORS(app)

    # Register blueprints
    app.register_blueprint(
        tender_bp,
        url_prefix="/api/v1/tenders"
    )

    app.register_blueprint(
        user_bp,
        url_prefix="/api/auth"
    )

    app.register_blueprint(
        documents_bp,
        url_prefix="/api"
    )

    # Create tables (development only)
    with app.app_context():
        db.create_all()

    return app