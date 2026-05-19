from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.middleware.role_middleware import role_required
from app.bids.views.bid_service import BidService
from app.bids.views.evaluation_service import BidEvaluationService
from app.bids.views.bid_schema import (
    bid_create_schema, bid_update_schema,
    bid_response_schema, bids_response_schema,
)


bids_bp = Blueprint("bids", __name__, url_prefix="/api/bids")


@bids_bp.route("", methods=["POST"])
@jwt_required()
@role_required("CONTRACTOR")
def submit_bid():
    try:
        data = bid_create_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422
    try:
        result = BidService.submit(data, get_jwt_identity(), request.remote_addr)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    bid = result["bid"] if isinstance(result, dict) else result
    msg = result.get("message", "Bid submitted") if isinstance(result, dict) else "Bid submitted"
    return jsonify({"message": msg, "bid": bid_response_schema.dump(bid)}), 201


@bids_bp.route("/me", methods=["GET"])
@jwt_required()
def my_bids():
    return jsonify({"bids": bids_response_schema.dump(BidService.list_mine(get_jwt_identity()))}), 200


@bids_bp.route("/tender/<string:tender_id>", methods=["GET"])
@jwt_required()
def bids_for_tender(tender_id):
    return jsonify({"bids": bids_response_schema.dump(BidService.list_for_tender(tender_id))}), 200


@bids_bp.route("/flagged", methods=["GET"])
@jwt_required()
@role_required("ADMIN")
def flagged_bids():
    return jsonify({"bids": bids_response_schema.dump(BidService.list_flagged())}), 200


@bids_bp.route("/<string:bid_id>", methods=["GET"])
@jwt_required()
def get_bid(bid_id):
    b = BidService.get(bid_id)
    if not b:
        return jsonify({"error": "Bid not found"}), 404
    return jsonify({"bid": bid_response_schema.dump(b)}), 200


@bids_bp.route("/<string:bid_id>", methods=["PATCH"])
@jwt_required()
@role_required("CONTRACTOR")
def update_bid(bid_id):
    b = BidService.get(bid_id)
    if not b:
        return jsonify({"error": "Bid not found"}), 404
    try:
        data = bid_update_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422
    try:
        b = BidService.update(b, data, get_jwt_identity())
    except (ValueError, PermissionError) as e:
        return jsonify({"error": str(e)}), 400 if isinstance(e, ValueError) else 403
    return jsonify({"bid": bid_response_schema.dump(b)}), 200


@bids_bp.route("/employer/all", methods=["GET"])
@jwt_required()
@role_required("EMPLOYER")
def employer_bids():

    employer_id = get_jwt_identity()

    try:
        bids = BidService.list_employer_bids(employer_id)

        return jsonify({
            "success": True,
            "total": len(bids),
            "bids": bids_response_schema.dump(bids)
        }), 200

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
@bids_bp.route(
    "/evaluate/<string:tender_id>",
    methods=["POST"]
)
@jwt_required()
@role_required("EMPLOYER")
def evaluate_tender(tender_id):

    try:

        winning_bid = (
            BidEvaluationService.evaluate_tender(
                tender_id
            )
        )

        return jsonify({
            "message": "Tender awarded successfully",
            "winning_bid": {
                "bid_id": winning_bid.id,
                "contractor_id": winning_bid.contractor_id,
                "bid_amount": winning_bid.bid_amount,
                "score": winning_bid.evaluation_score
            }
        }), 200

    except ValueError as e:

        return jsonify({
            "error": str(e)
        }), 400