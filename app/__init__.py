from flask import Flask
from config import Config
from app.extensions import db, jwt, ma, bcrypt, migrate
from app.middleware.error_middleware import register_error_handlers
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    
  


    db.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)


    CORS(
        app,
        resources={r"/*": {
            "origins": [
                "http://localhost:5173", "http://127.0.0.1:5173",
                "http://localhost:5174", "http://127.0.0.1:5174",
                "http://localhost:5175", "http://127.0.0.1:5175",
                "http://localhost:5176", "http://127.0.0.1:5176",
                "http://localhost:5177", "http://127.0.0.1:5177",
                "http://localhost:5178", "http://127.0.0.1:5178",
            ]
        }},
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )



    register_error_handlers(app)

    from app.auth.controllers.user_routes import auth_bp
    from app.tenders.controllers.tender_routes import tenders_bp
    from app.bids.controllers.bid_routes import bids_bp
    from app.documents.controllers.document_routes import documents_bp
    from app.notifications.controllers.notification_routes import notifications_bp
    from app.awards.controllers.award_routes import awards_bp
    from app.auth.controllers.admin_routes import admin_bp
    from app.awardletters.controllers.award_letter_routes import award_letter_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(tenders_bp)
    app.register_blueprint(bids_bp)
    app.register_blueprint(documents_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(awards_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(award_letter_bp)

    with app.app_context():
        from app.auth.models.user import User
        from app.tenders.models.tender import Tender
        from app.bids.models.bid import Bid
        from app.documents.models.document import Document
        from app.notifications.models.notification import Notification
        from app.awards.models.award import Award
        from app.awardletters.models.award_letter import AwardLetter

        db.create_all()

    return app