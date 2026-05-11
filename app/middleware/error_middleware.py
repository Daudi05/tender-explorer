from flask import jsonify
from werkzeug.exceptions import HTTPException
from sqlalchemy.exc import SQLAlchemyError
import traceback

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

    # Handle all HTTP errors
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return jsonify({
            "success": False,
            "message": error.description,
            "status_code": error.code
        }), error.code

    @app.errorhandler(401)
    def unauthorized(e):
        return handle_error("Missing or invalid token", 401)

    
