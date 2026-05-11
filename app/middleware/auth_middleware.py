from functools import wraps

from flask import jsonify

from flask_jwt_extended import (
    verify_jwt_in_request,
    get_jwt_identity
)


def auth_required(fn):

    @wraps(fn)
    def wrapper(*args, **kwargs):

        try:
            verify_jwt_in_request()

            return fn(*args, **kwargs)

        except Exception as error:

            return jsonify({
                "success": False,
                "message": "Authentication required",
                "error": str(error)
            }), 401

    return wrapper


def current_user():

    try:
        verify_jwt_in_request()

        return get_jwt_identity()

    except Exception:
        return None