from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.middleware.role_middleware import role_required
from app.tenders.views.tender_service import TenderService
from app.tenders.views.tender_schema import (
    tender_create_schema, tender_update_schema,
    tender_response_schema, tenders_response_schema,
)

tenders_bp = Blueprint("tenders", __name__, url_prefix="/api/tenders")


@tenders_bp.route("", methods=["POST"])
@jwt_required()
@role_required("EMPLOYER")
def create_tender():
    try:
        data = tender_create_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422
    tender = TenderService.create(data, get_jwt_identity())
    return jsonify({"message": "Tender created", "tender": tender_response_schema.dump(tender)}), 201


@tenders_bp.route("", methods=["GET"])
@jwt_required()
def list_tenders():
    args = request.args
    if any(k in args for k in ("search", "category", "min_budget", "max_budget")):
        tenders = TenderService.search(
            keyword=args.get("search"),
            category=args.get("category"),
            min_budget=float(args["min_budget"]) if args.get("min_budget") else None,
            max_budget=float(args["max_budget"]) if args.get("max_budget") else None,
        )
    else:
        tenders = TenderService.list_all()
    return jsonify({"tenders": tenders_response_schema.dump(tenders)}), 200


@tenders_bp.route("/active", methods=["GET"])
@jwt_required()
def list_active():
    return jsonify({"tenders": tenders_response_schema.dump(TenderService.list_active())}), 200


@tenders_bp.route("/me", methods=["GET"])
@jwt_required()
@role_required("EMPLOYER")
def my_tenders():
    return jsonify({"tenders": tenders_response_schema.dump(TenderService.list_by_employer(get_jwt_identity()))}), 200


@tenders_bp.route("/<string:tender_id>", methods=["GET"])
@jwt_required()
def get_tender(tender_id):
    t = TenderService.get(tender_id)
    if not t:
        return jsonify({"error": "Tender not found"}), 404
    return jsonify({"tender": tender_response_schema.dump(t)}), 200


@tenders_bp.route("/<string:tender_id>", methods=["PATCH"])
@jwt_required()
@role_required("EMPLOYER")
def update_tender(tender_id):
    t = TenderService.get(tender_id)
    if not t:
        return jsonify({"error": "Tender not found"}), 404
    try:
        data = tender_update_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422
    try:
        t = TenderService.update(t, data, get_jwt_identity())
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403
    return jsonify({"tender": tender_response_schema.dump(t)}), 200


@tenders_bp.route("/<string:tender_id>", methods=["DELETE"])
@jwt_required()
@role_required("EMPLOYER")
def delete_tender(tender_id):
    t = TenderService.get(tender_id)
    if not t:
        return jsonify({"error": "Tender not found"}), 404
    try:
        TenderService.delete(t, get_jwt_identity())
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403
    return jsonify({"message": "Tender deleted"}), 200
