from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.awards.views.award_service import AwardService
from app.awards.views.award_schema import (
    award_create_schema,
    award_status_update_schema,
    award_response_schema,
    awards_response_schema,
)

awards_bp = Blueprint("awards", __name__, url_prefix="/api/awards")


@awards_bp.route("", methods=["POST"])
@jwt_required()
def create_award():
    try:
        data = award_create_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    awarded_by = get_jwt_identity()
    award = AwardService.create_award(data, awarded_by)
    return jsonify({"message": "Award created", "award": award_response_schema.dump(award)}), 201


@awards_bp.route("/me/wins", methods=["GET"])
@jwt_required()
def my_wins():
    awards = AwardService.list_my_wins(get_jwt_identity())
    return jsonify({"awards": awards_response_schema.dump(awards)}), 200


@awards_bp.route("/me/issued", methods=["GET"])
@jwt_required()
def my_issued():
    awards = AwardService.list_my_issued(get_jwt_identity())
    return jsonify({"awards": awards_response_schema.dump(awards)}), 200


@awards_bp.route("/<string:award_id>", methods=["GET"])
@jwt_required()
def get_award(award_id):
    award = AwardService.get(award_id)
    if not award:
        return jsonify({"error": "Award not found"}), 404
    return jsonify({"award": award_response_schema.dump(award)}), 200


@awards_bp.route("/<string:award_id>/status", methods=["PATCH"])
@jwt_required()
def update_status(award_id):
    award = AwardService.get(award_id)
    if not award:
        return jsonify({"error": "Award not found"}), 404

    try:
        data = award_status_update_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        award = AwardService.update_status(award, data["status"], get_jwt_identity())
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403

    return jsonify({"award": award_response_schema.dump(award)}), 200


@awards_bp.route("/<string:award_id>/attach-letter", methods=["POST"])
@jwt_required()
def attach_letter(award_id):
    award = AwardService.get(award_id)
    if not award:
        return jsonify({"error": "Award not found"}), 404

    data = request.get_json() or {}
    document_id = data.get("document_id")
    if not document_id:
        return jsonify({"error": "document_id is required"}), 400

    award = AwardService.attach_letter(award, document_id)
    return jsonify({"award": award_response_schema.dump(award)}), 200
