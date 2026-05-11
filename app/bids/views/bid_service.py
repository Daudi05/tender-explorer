#this is the service layer for the bid app, it contains the business logic for the bid app

from app.bids.models.bid_repo import create_bid


def submit_bid(data):

    bid = create_bid(data)

    return {
        "message": "Bid submitted successfully",
        "bid_id": bid.id
    }