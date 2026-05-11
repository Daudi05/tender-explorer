from flask import Flask, jsonify, Config
from flask_cors import CORS
from app.extensions import db, ma, jwt, migrate
from app.middleware.error_middleware import register_error_handlers
from app.tenders.controllers.tender_routes import tender_bp
#from app.bids.controllers.bid_routes import bid_bp
from config import Config
from app.auth.controllers.user_routes import user_bp
from app.documents.controllers.document_routes import documents_bp
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)
    ma.init_app(app)

    # Register Global Error Handlings here later 
    register_error_handlers(app)
    


    app.register_blueprint(tender_bp, url_prefix='/api/v1/tenders')
    app.register_blueprint(user_bp, url_prefix='/api/auth/')
    #app.register_blueprint(bid_bp, url_prefix='/api/bid')
    app.register_blueprint(documents_bp, url_prefix='/api')


    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"success": False, "message": "Bad request"}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({"success": False, "message": "Internal server error"}), 500

    return app
