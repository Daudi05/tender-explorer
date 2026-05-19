from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.middleware.role_middleware import role_required
from app.bids.views.bid_service import BidService
from app.documents.views.document_service import DocumentService
from app.bids.views.evaluation_service import BidEvaluationService
from app.bids.views.bid_schema import (
    bid_create_schema, bid_update_schema,
    bid_response_schema, bids_response_schema,
)
from app.auth.models.user import User
from app.tenders.views.tender_service import TenderService

# Contractors without admin-verified documents get 403, not 400
VERIFICATION_ERRORS = {"No verified documents"}

bids_bp = Blueprint("bids", __name__, url_prefix="/api/bids")


@bids_bp.route("", methods=["POST"])
@jwt_required()
@role_required("CONTRACTOR")
def submit_bid():

    try:
        # Accept both JSON and multipart form data
        if request.content_type and "application/json" in request.content_type:
            raw = request.get_json() or {}
        else:
            raw = {
                "tender_id": request.form.get("tender_id"),
                "bid_amount": request.form.get("bid_amount"),
                "proposal_summary": request.form.get("proposal_summary"),
                "completion_months": request.form.get("completion_months"),
            }

        data = bid_create_schema.load(raw)

    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    try:
        result = BidService.submit(data, get_jwt_identity(), request.remote_addr)

        # BidService.submit returns {"bid": <Bid>, "message": "..."} or just a Bid
        bid_obj = result["bid"] if isinstance(result, dict) else result
        msg = result.get("message", "Bid submitted successfully") if isinstance(result, dict) else "Bid submitted successfully"

        # Handle optional file upload alongside the bid
        uploaded_files = request.files.getlist("file")
        for uploaded_file in uploaded_files:
            if uploaded_file.filename == "":
                continue
            try:
                DocumentService.upload(
                    uploaded_file,
                    {"document_type": request.form.get("document_type") or "BID_SUPPORT_DOCUMENT"},
                    get_jwt_identity(),
                )
            except Exception:
                pass  # file upload failure should not break the bid submission

    except ValueError as e:
        status = 403 if str(e) in VERIFICATION_ERRORS else 400
        return jsonify({"error": str(e)}), status

    return jsonify({"message": msg, "bid": bid_response_schema.dump(bid_obj)}), 201


@bids_bp.route("/me", methods=["GET"])
@jwt_required()
def my_bids():
    return jsonify({"bids": bids_response_schema.dump(BidService.list_mine(get_jwt_identity()))}), 200


@bids_bp.route("/tender/<string:tender_id>", methods=["GET"])
@jwt_required()
def bids_for_tender(tender_id):
    requester_id = get_jwt_identity()
    requester = User.query.get(requester_id)
    if not requester:
        return jsonify({"error": "User not found"}), 404
    # Admins can see any tender's bids; employers only their own
    if requester.role == "EMPLOYER":
        tender = TenderService.get(tender_id)
        if not tender or tender.employer_id != requester_id:
            return jsonify({"error": "Access denied"}), 403
    elif requester.role != "ADMIN":
        return jsonify({"error": "Access denied"}), 403
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
        return jsonify({"success": True, "total": len(bids), "bids": bids_response_schema.dump(bids)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bids_bp.route("/evaluate/<string:tender_id>", methods=["POST"])
@jwt_required()
@role_required("EMPLOYER")
def evaluate_tender(tender_id):
    try:
        winning_bid = BidEvaluationService.evaluate_tender(tender_id)
        return jsonify({
            "message": "Tender awarded successfully",
            "winning_bid": {
                "bid_id": winning_bid.id,
                "contractor_id": winning_bid.contractor_id,
                "bid_amount": winning_bid.bid_amount,
                "score": winning_bid.evaluation_score,
            }
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
