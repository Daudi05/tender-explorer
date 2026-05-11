from flask import Flask
from app.extensions import db, ma, jwt, migrate
from app.middleware.error_middleware import register_error_handlers
from app.tenders.controllers.tender_routes import tender_bp
#from app.bids.controllers.bid_routes import bid_bp
from app.auth.controllers.user_routes import user_bp
from app.documents.controllers.document_routes import document_bp
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
    


    app.register_blueprint(tender_bp, url_prefix='/api/v1/tenders')
    app.register_blueprint(user_bp, url_prefix='/api/auth/')
    #app.register_blueprint(bid_bp, url_prefix='/api/bid')
    app.register_blueprint(document_bp, url_prefix='/api')


    # To be filled later here for the blueprints 
    # app.register_blueprint(auth_bp)
    # app.register_blueprint(tender_bp)

    return app
