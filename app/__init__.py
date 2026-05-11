from flask import Flask,jsonify
from app.extensions import db, migrate, jwt, cors
from config import Config
from app.auth.controllers.user_routes import user_bp
from app.middleware.error_middleware import register_jwt_errors

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)

    app.register_blueprint(user_bp, url_prefix="/api/auth")
   

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
