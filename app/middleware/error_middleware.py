#error handling in middleware :detailed with status error no and message 

from app.utils.validations import handle_error
from flask import jsonify


def register_jwt_errors(jwt):

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):

        return jsonify({
            "success": False,
            "message": "Token has expired"
        }), 401


    @jwt.invalid_token_loader
    def invalid_token_callback(error):

        return jsonify({
            "success": False,
            "message": "Invalid token"
        }), 401


    @jwt.unauthorized_loader
    def missing_token_callback(error):

        return jsonify({
            "success": False,
            "message": "Authorization token required"
        }), 401

def register_error_handlers(app):
    @app.errorhandler(404)
    def not_found(e):
        return handle_error("Resource not found", 404)

    @app.errorhandler(500)
    def internal_error(e):
        return handle_error("An internal server error occurred", 500)

    @app.errorhandler(401)
    def unauthorized(e):
        return handle_error("Missing or invalid token", 401)

    
