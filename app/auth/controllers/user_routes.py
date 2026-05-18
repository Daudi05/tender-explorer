from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.auth.views.user_service import AuthService
from app.auth.views.user_schema import (
    register_schema, login_schema, user_response_schema,
)

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        print("RAW:", request.get_json())

        data = register_schema.load(request.get_json() or {})

        print("VALIDATED:", data)

        user, token = AuthService.register(
            data,
            request.remote_addr
        )

        return jsonify({
            "message": "Registered. Check email to verify.",
            "user": user_response_schema.dump(user),
            "verification_token": token,
        }), 201

    except ValidationError as err:
        print("VALIDATION ERROR:", err.messages)

        return jsonify({
            "error": "Validation failed",
            "details": err.messages
        }), 422

    except ValueError as e:
        print("VALUE ERROR:", str(e))

        return jsonify({
            "error": str(e)
        }), 400

    except Exception as e:
        print("SERVER ERROR:", str(e))

        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = login_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422
    try:
        user, token = AuthService.login(data, request.remote_addr)
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    return jsonify({
        "message": "Login successful",
        "access_token": token,
        "user": user_response_schema.dump(user),
    }), 200


@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    token = (request.get_json() or {}).get("token")
    if not token:
        return jsonify({"error": "token required"}), 400
    user = AuthService.verify_email(token)
    if not user:
        return jsonify({"error": "Invalid token"}), 400
    return jsonify({"message": "Email verified", "user": user_response_schema.dump(user)}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user = AuthService.get_user(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user_response_schema.dump(user)}), 200
