from flask import jsonify
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError


def register_error_handlers(app):

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "success": False,
            "message": "Bad request"
        }), 400


    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401


    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            "success": False,
            "message": "Forbidden"
        }), 403


    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "message": "Resource not found"
        }), 404


    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "success": False,
            "message": "Method not allowed"
        }), 405


    @app.errorhandler(422)
    def validation_error(error):
        return jsonify({
            "success": False,
            "message": "Validation failed"
        }), 422


    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({
            "success": False,
            "message": "Internal server error"
        }), 500


    @app.errorhandler(ValidationError)
    def marshmallow_validation(error):
        return jsonify({
            "success": False,
            "message": "Validation error",
            "errors": error.messages
        }), 422


    @app.errorhandler(IntegrityError)
    def database_integrity_error(error):
        return jsonify({
            "success": False,
            "message": "Database integrity error"
        }), 400


    @app.errorhandler(Exception)
    def handle_general_exception(error):

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500