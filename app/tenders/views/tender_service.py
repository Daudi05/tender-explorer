from datetime import datetime
from app.tenders.models.tender_repo import TenderRepository
from app.extensions import db


class TenderService:
    @staticmethod
    def create(data, employer_id):
        return TenderRepository.create({**data, "employer_id": employer_id, "status": "OPEN"})

    @staticmethod
    def get(tender_id):
        return TenderRepository.get_by_id(tender_id)

    @staticmethod
    def list_all():
        return TenderRepository.list_all()

    @staticmethod
    def list_active():
        return TenderRepository.list_active()

    @staticmethod
    def list_by_employer(employer_id):
        return TenderRepository.list_by_employer(employer_id)

    @staticmethod
    def search(**kwargs):
        return TenderRepository.search(**kwargs)

    @staticmethod
    def update(tender, data, requester_id):
        from app.bids.models.bid import Bid
        if tender.employer_id != requester_id:
            raise PermissionError("Only the owner can update this tender")
        winning_bid_id = data.pop("winning_bid_id", None)
        for k, v in data.items():
            setattr(tender, k, v)
        if winning_bid_id:
            tender.winning_bid_id = winning_bid_id
            tender.status = "AWARDED"
            tender.awarded_at = datetime.utcnow()
            bids = Bid.query.filter_by(tender_id=tender.id).all()
            for b in bids:
                b.status = "AWARDED" if b.id == winning_bid_id else "REJECTED"
                if b.id == winning_bid_id:
                    b.is_winner = True
            db.session.commit()
        return TenderRepository.update(tender)

    @staticmethod
    def delete(tender, requester_id):
        if tender.employer_id != requester_id:
            raise PermissionError("Only the owner can delete this tender")
        TenderRepository.delete(tender)

    @staticmethod
    def is_deadline_passed(tender):
        return datetime.utcnow() > tender.deadline
