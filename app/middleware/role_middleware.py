from functools import wraps
from flask_jwt_extended import get_jwt, verify_jwt_in_request
from app.utils.validations import handle_error

def role_required(role_name):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()

             role = claims.get("role")

                if role not in allowed_roles:

                    return jsonify({
                        "success": False,
                        "message": "Access forbidden",
                        "required_roles": allowed_roles,
                        "your_role": role
                    }), 403

                return fn(*args, **kwargs)

            except Exception as error:

                return jsonify({
                    "success": False,
                    "message": "Authorization failed",
                    "error": str(error)
                }), 401

           
            if claims.get("role") != role_name:
                return handle_error(f"Access Denied: Requires {role_name} role", 403)
            return fn(*args, **kwargs)
        return decorator
    return wrapper



