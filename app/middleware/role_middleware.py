from functools import wraps

from flask import jsonify
from flask_jwt_extended import (
    get_jwt,
    verify_jwt_in_request
)


def role_required(*allowed_roles):

    def wrapper(fn):

        @wraps(fn)
        def decorator(*args, **kwargs):

            try:
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

        return decorator

    return wrapper