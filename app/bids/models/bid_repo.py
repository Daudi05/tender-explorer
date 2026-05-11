# this is the function that saves the bid to the database

from app.extensions import db
from app.bids.models.bid import Bid


def create_bid(data):

    bid = Bid(
        contractor_id=data["contractor_id"],
        tender_id=data["tender_id"],
        amount=data["amount"],
        proposal=data["proposal"]
    )

    db.session.add(bid)

    db.session.commit()

    return bid