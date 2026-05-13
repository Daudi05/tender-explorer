from sqlalchemy import func
from app.extensions import db
from app.bids.models.bid import Bid
from app.bids.models.bid_repo import BidRepository
from app.tenders.views.tender_service import TenderService
from app.tenders.models.tender import Tender


def _calculate_fraud_score(bid_amount, tender_avg, submission_ip, other_ips):
    score = 0.0
    if tender_avg > 0 and bid_amount < (tender_avg * 0.5):
        score += 40  # suspicious low bid
    if submission_ip and submission_ip in other_ips:
        score += 40  # same IP, different account
    return score


class BidService:
    @staticmethod
    def submit(data, contractor_id, request_ip):
        tender = TenderService.get(data["tender_id"])
        if not tender:
            raise ValueError("Tender not found")
        if TenderService.is_deadline_passed(tender):
            raise ValueError("Tender deadline has passed")
        if BidRepository.existing(data["tender_id"], contractor_id):
            raise ValueError("You already submitted a bid for this tender")

        bid = Bid(
            tender_id=data["tender_id"],
            contractor_id=contractor_id,
            bid_amount=data["bid_amount"],
            proposal_summary=data.get("proposal_summary"),
            completion_months=data.get("completion_months"),
            submission_ip=request_ip,
            status="SUBMITTED",
        )
        db.session.add(bid)
        db.session.flush()

        # fraud scoring
        avg = db.session.query(func.avg(Bid.bid_amount)).filter(
            Bid.tender_id == data["tender_id"], Bid.id != bid.id,
        ).scalar() or 0
        other_ips = {b.submission_ip for b in Bid.query.filter(
            Bid.tender_id == data["tender_id"], Bid.id != bid.id,
        ).all() if b.submission_ip}

        bid.fraud_score = _calculate_fraud_score(bid.bid_amount, avg, request_ip, other_ips)
        bid.is_flagged = bid.fraud_score >= 60

        db.session.commit()
        return bid

    @staticmethod
    def get(bid_id):
        return BidRepository.get_by_id(bid_id)

    @staticmethod
    def list_mine(contractor_id):
        return BidRepository.list_by_contractor(contractor_id)

    @staticmethod
    def list_for_tender(tender_id):
        return BidRepository.list_by_tender(tender_id)

    @staticmethod
    def list_flagged():
        return BidRepository.list_flagged()

    @staticmethod
    def update(bid, data, contractor_id):
        if bid.contractor_id != contractor_id:
            raise PermissionError("Only the bid owner can update")
        tender = TenderService.get(bid.tender_id)
        if tender and TenderService.is_deadline_passed(tender):
            raise ValueError("Cannot edit - tender deadline passed")
        for k, v in data.items():
            setattr(bid, k, v)
        return BidRepository.update(bid)
    @staticmethod
    def list_employer_bids(employer_id):

        bids = (
            db.session.query(Bid)
            .join(
                Tender,
                Bid.tender_id == Tender.id
            )
            .filter(
                Tender.employer_id == employer_id
            )
            .all()
        )

        return bids
