from flask import Blueprint, request

from app.bids.views.bid_service import (
    submit_bid,
    get_all_bids,
    get_single_bid,
    update_single_bid,
    delete_single_bid
)

bid_bp = Blueprint("bid_bp", __name__)


# CREATE BID
@bid_bp.route("/bids", methods=["POST"])
def create_new_bid():

    data = request.get_json()

    return submit_bid(data)


# GET ALL BIDS
@bid_bp.route("/bids", methods=["GET"])
def fetch_bids():

    return get_all_bids()


# GET SINGLE BID
@bid_bp.route("/bids/<int:bid_id>", methods=["GET"])
def fetch_single_bid(bid_id):

    return get_single_bid(bid_id)


# UPDATE BID
@bid_bp.route("/bids/<int:bid_id>", methods=["PUT"])
def update_bid(bid_id):

    data = request.get_json()

    return update_single_bid(bid_id, data)


# DELETE BID
@bid_bp.route("/bids/<int:bid_id>", methods=["DELETE"])
def delete_bid(bid_id):

    return delete_single_bid(bid_id)