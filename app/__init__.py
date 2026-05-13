from flask import Flask
from config import Config
from app.extensions import db, jwt, ma, bcrypt
from app.middleware.error_middleware import register_error_handlers


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)
    bcrypt.init_app(app)
    register_error_handlers(app)

    # Register all the module blueprints
    from app.auth.controllers.user_routes import auth_bp
    from app.tenders.controllers.tender_routes import tenders_bp
    from app.bids.controllers.bid_routes import bids_bp
    from app.documents.controllers.document_routes import documents_bp
    from app.notifications.controllers.notification_routes import notifications_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(tenders_bp, url_prefix="/api/v1/tenders")
    app.register_blueprint(bids_bp, url_prefix="/api/v1/bids")
    app.register_blueprint(documents_bp, url_prefix="/api/v1/documents")
    app.register_blueprint(notifications_bp, url_prefix="/api/v1/notifications")

    # Create database tables (imports trigger SQLAlchemy registration)
    with app.app_context():
        from app.auth.models.user import User
        from app.tenders.models.tender import Tender
        from app.bids.models.bid import Bid
        from app.documents.models.document import Document
        from app.notifications.models.notification import Notification
        db.create_all()

    return app
