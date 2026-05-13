#error handling in middleware :detailed with status error no and message 

from app.utils.validations import handle_error

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
