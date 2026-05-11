from flask import Blueprint, request
from app.bids.views.bid_service import submit_bid

# Blueprint
bid_bp = Blueprint("bid_bp", __name__)

# CREATE BID (your chosen style)
@bid_bp.route("/", methods=["POST"])
def create_new_bid():
    data = request.get_json()
    return submit_bid(data)