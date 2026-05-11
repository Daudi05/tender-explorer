# this handles all the routes for bids

from flask import Blueprint, request
from app.bids.views.bid_service import submit_bid


bid_bp = Blueprint("bid_bp", __name__)


@bid_bp.route("/bids", methods=["POST"])
def create_new_bid():

    data = request.get_json()

    return submit_bid(data)