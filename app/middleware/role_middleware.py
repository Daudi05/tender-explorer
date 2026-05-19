from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from app.utils.validations import handle_error


def role_required(*allowed_roles):
    """
    Role-based access control decorator.

    Usage:
        @role_required("ADMIN")
        @role_required("EMPLOYER", "ADMIN")
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # Ensure JWT is present
            verify_jwt_in_request()

            # Get JWT claims
            claims = get_jwt()

            # Extract role safely
            user_role = claims.get("role")

            # If role missing or not allowed
            if not user_role or user_role not in allowed_roles:
                return handle_error(
                    f"Access Denied: Requires {', '.join(allowed_roles)} role(s)",
                    403
                )

            return fn(*args, **kwargs)

        return decorator
    return wrapper
