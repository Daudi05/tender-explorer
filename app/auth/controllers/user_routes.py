from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    create_access_token
)

from ..models.user_repo import (
    get_user_by_email,
    get_user_by_id,
    create_user
)

from ..utils.auth_validators import (
    validate_register_data,
    validate_login_data
)

user_bp = Blueprint("user_bp", __name__)



@user_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json() or {}

    errors = validate_register_data(data)

    if errors:
        return jsonify({
            "success": False,
            "message": "Validation failed",
            "errors": errors
        }), 400

   
    existing_user = get_user_by_email(data["email"])

    if existing_user:
        return jsonify({
            "success": False,
            "message": "Email already exists"
        }), 409

   
    user = create_user(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        password=data["password"],
        role=data.get("role", "contractor")
    )

   
    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "data": {
            "user": user.to_dict()
        }
    }), 201


@user_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json() or {}

    errors = validate_login_data(data)

    if errors:
        return jsonify({
            "success": False,
            "message": "Validation failed",
            "errors": errors
        }), 400

    user = get_user_by_email(data["email"])

   
    if not user or not user.check_password(data["password"]):
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

   
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role
        }
    )

    return jsonify({
        "success": True,
        "message": "Login successful",
        "data": {
            "user": user.to_dict(),
            "access_token": access_token
        }
    }), 200


@user_bp.route("/me", methods=["GET"])
@jwt_required()
def me():

  
    user_id = get_jwt_identity()

  
    user = get_user_by_id(user_id)

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    return jsonify({
        "success": True,
        "message": "Profile fetched successfully",
        "data": user.to_dict()
    }), 200