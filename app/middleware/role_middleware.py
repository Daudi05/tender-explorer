from functools import wraps
from flask_jwt_extended import get_jwt, verify_jwt_in_request
from app.utils.validations import handle_error

def role_required(role_name):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()

            ##The  role for JWT identity to be included here by the person working on auth part 
            # in here  Brian (Dev 1) includes 'role' in the JWT identity
            if claims.get("role") != role_name:
                return handle_error(f"Access Denied: Requires {role_name} role", 403)
            return fn(*args, **kwargs)
        return decorator
    return wrapper
