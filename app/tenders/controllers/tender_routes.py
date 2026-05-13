from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.middleware.role_middleware import role_required
from app.bids.models.bid import Bid
from app.auth.models.user import User
from app.tenders.views.tender_service import TenderService
from app.tenders.views.auto_award_service import TenderAutoAwardService
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
@tenders_bp.route("/<string:tender_id>/close", methods=["POST"])
@jwt_required()
@role_required("EMPLOYER")
def close_tender(tender_id):

    try:
        winner = TenderAutoAwardService.close_and_award(tender_id)

        if not winner:
            return jsonify({
                "message": "No winner found"
            }), 404

        # Get contractor details
        contractor = winner.contractor

        # Get tender details
        tender = winner.tender

        return jsonify({

            "message": "Tender closed and awarded successfully",

            # TENDER DETAILS
            "tender": {
                "id": tender.id,
                "title": tender.title,
                "description": tender.description,
                "category": tender.category,
                "budget": tender.budget,
                "deadline": tender.deadline,
                "status": tender.status,
                "awarded_at": tender.awarded_at
            },

            # WINNING BID DETAILS
            "winning_bid": {
                "bid_id": winner.id,
                "bid_amount": winner.bid_amount,
                "proposal_summary": winner.proposal_summary,
                "completion_months": winner.completion_months,
                "evaluation_score": winner.evaluation_score,
                "fraud_score": winner.fraud_score,
                "is_flagged": winner.is_flagged,
                "status": winner.status,
                "submitted_at": winner.created_at
            },

            # CONTRACTOR DETAILS
            "contractor": {
                "id": contractor.id,
                "name": contractor.name,
                "email": contractor.email,
                "phone": contractor.phone,
                "role": contractor.role,
                "reputation_score": contractor.reputation_score,
                "is_verified": contractor.is_verified,
                "is_active": contractor.is_active,
                "joined_at": contractor.created_at
            }

        }), 200

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 400
    
@tenders_bp.route("/<string:tender_id>/details", methods=["GET"])
@jwt_required()
def get_tender_details(tender_id):

    t = TenderService.get(tender_id)

    if not t:
        return jsonify({"error": "Tender not found"}), 404

    # Get winning bid
    winning_bid = None
    contractor = None

    if t.winning_bid_id:
        winning_bid = Bid.query.get(t.winning_bid_id)

        if winning_bid:
            contractor = User.query.get(winning_bid.contractor_id)

    return jsonify({
        "tender": tender_response_schema.dump(t),

        #  WINNER SECTION (OPTION 2 IMPLEMENTATION)
        "winner": {
            "bid": {
                "id": winning_bid.id if winning_bid else None,
                "bid_amount": winning_bid.bid_amount if winning_bid else None,
                "proposal_summary": winning_bid.proposal_summary if winning_bid else None,
                "completion_months": winning_bid.completion_months if winning_bid else None,
                "evaluation_score": winning_bid.evaluation_score if winning_bid else None,
                "status": winning_bid.status if winning_bid else None
            } if winning_bid else None,

            "contractor": {
                "id": contractor.id if contractor else None,
                "name": contractor.name if contractor else None,
                "email": contractor.email if contractor else None,
                "phone": contractor.phone if contractor else None,
                "reputation_score": contractor.reputation_score if contractor else None
            } if contractor else None
        }
    }), 200