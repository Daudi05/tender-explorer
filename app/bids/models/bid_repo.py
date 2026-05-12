from app.extensions import db
from app.bids.models.bid import Bid


class BidRepository:
    @staticmethod
    def create(data):
        b = Bid(**data)
        db.session.add(b)
        db.session.commit()
        return b

    @staticmethod
    def get_by_id(bid_id):
        return db.session.get(Bid, bid_id)

    @staticmethod
    def list_by_contractor(contractor_id):
        return Bid.query.filter_by(contractor_id=contractor_id).order_by(Bid.created_at.desc()).all()

    @staticmethod
    def list_by_tender(tender_id):
        return Bid.query.filter_by(tender_id=tender_id).order_by(Bid.bid_amount.asc()).all()

    @staticmethod
    def list_flagged():
        return Bid.query.filter_by(is_flagged=True).order_by(Bid.fraud_score.desc()).all()

    @staticmethod
    def existing(tender_id, contractor_id):
        return Bid.query.filter_by(tender_id=tender_id, contractor_id=contractor_id).first()

    @staticmethod
    def update(bid):
        db.session.commit()
        return bid
