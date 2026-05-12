from flask import jsonify

from app.bids.models.bid import Bid
from app.bids.models.bid_repo import create_bid
from app.extensions import db


ALLOWED_STATUS = [
    "Submitted",
    "In Review",
    "Awarded",
    "Rejected"
]


# CREATE BID
def submit_bid(data):

    try:

        required_fields = [
            "contractor_id",
            "tender_id",
            "amount",
            "proposal"
        ]

        # CHECK MISSING FIELDS
        for field in required_fields:

            if field not in data:
                return jsonify({
                    "error": f"{field} is required"
                }), 400

            if str(data[field]).strip() == "":
                return jsonify({
                    "error": f"{field} cannot be empty"
                }), 400

        # VALIDATE contractor_id
        if not isinstance(data["contractor_id"], int):
            return jsonify({
                "error": "contractor_id must be an integer"
            }), 400

        # VALIDATE tender_id
        if not isinstance(data["tender_id"], int):
            return jsonify({
                "error": "tender_id must be an integer"
            }), 400

        # VALIDATE amount
        if not isinstance(data["amount"], (int, float)):
            return jsonify({
                "error": "amount must be a number"
            }), 400

        # NEGATIVE AMOUNT CHECK
        if data["amount"] <= 0:
            return jsonify({
                "error": "amount must be greater than zero"
            }), 400

        # VALIDATE PROPOSAL
        if len(data["proposal"]) < 10:
            return jsonify({
                "error": "proposal must be at least 10 characters"
            }), 400

        # CREATE BID
        bid = create_bid(data)

        return jsonify({
            "message": "Bid submitted successfully",
            "bid_id": bid.id
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500


# GET ALL BIDS
def get_all_bids():

    try:

        bids = Bid.query.all()

        results = []

        for bid in bids:

            results.append({
                "id": bid.id,
                "uuid": bid.uuid,
                "contractor_id": bid.contractor_id,
                "tender_id": bid.tender_id,
                "amount": bid.amount,
                "proposal": bid.proposal,
                "status": bid.status,
                "created_at": bid.created_at
            })

        return jsonify(results), 200

    except Exception as e:

        return jsonify({
            "error": "Failed to fetch bids",
            "details": str(e)
        }), 500


# GET ONE BID
def get_single_bid(bid_id):

    try:

        bid = Bid.query.get(bid_id)

        if not bid:
            return jsonify({
                "error": "Bid not found"
            }), 404

        return jsonify({
            "id": bid.id,
            "uuid": bid.uuid,
            "contractor_id": bid.contractor_id,
            "tender_id": bid.tender_id,
            "amount": bid.amount,
            "proposal": bid.proposal,
            "status": bid.status,
            "created_at": bid.created_at
        }), 200

    except Exception as e:

        return jsonify({
            "error": "Failed to fetch bid",
            "details": str(e)
        }), 500


# UPDATE BID
def update_single_bid(bid_id, data):

    try:

        bid = Bid.query.get(bid_id)

        if not bid:
            return jsonify({
                "error": "Bid not found"
            }), 404

        # UPDATE AMOUNT
        if "amount" in data:

            if not isinstance(data["amount"], (int, float)):
                return jsonify({
                    "error": "amount must be a number"
                }), 400

            if data["amount"] <= 0:
                return jsonify({
                    "error": "amount must be greater than zero"
                }), 400

            bid.amount = data["amount"]

        # UPDATE PROPOSAL
        if "proposal" in data:

            if len(data["proposal"]) < 10:
                return jsonify({
                    "error": "proposal must be at least 10 characters"
                }), 400

            bid.proposal = data["proposal"]

        # UPDATE STATUS
        if "status" in data:

            if data["status"] not in ALLOWED_STATUS:
                return jsonify({
                    "error": "Invalid bid status"
                }), 400

            bid.status = data["status"]

        db.session.commit()

        return jsonify({
            "message": "Bid updated successfully"
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": "Failed to update bid",
            "details": str(e)
        }), 500


# DELETE BID
def delete_single_bid(bid_id):

    try:

        bid = Bid.query.get(bid_id)

        if not bid:
            return jsonify({
                "error": "Bid not found"
            }), 404

        db.session.delete(bid)

        db.session.commit()

        return jsonify({
            "message": "Bid deleted successfully"
        }), 200

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": "Failed to delete bid",
            "details": str(e)
        }), 500