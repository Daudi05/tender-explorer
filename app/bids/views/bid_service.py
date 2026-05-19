from sqlalchemy import func
from app.extensions import db

from app.bids.models.bid import Bid
from app.bids.models.bid_repo import BidRepository
from app.tenders.views.tender_service import TenderService
from app.tenders.models.tender import Tender
from app.auth.models.user import User
from app.tenders.views.auto_award_service import TenderAutoAwardService
from app.documents.models.document import Document
from app.notifications.views.notification_service import NotificationService


# FRAUD SCORING ENGINE

def _calculate_fraud_score(bid_amount, tender_avg, submission_ip, other_ips):
    score = 0.0

    if tender_avg > 0:
        # suspicious LOW bid
        if bid_amount < (tender_avg * 0.5):
            score += 40

        # suspicious HIGH bid
        if bid_amount > (tender_avg * 2):
            score += 30

    # IP reuse signal
    if submission_ip and submission_ip in other_ips:
        score += 20

    return min(score, 100)



# BID SERVICE
#
class BidService:

    @staticmethod
    def submit(data, contractor_id, request_ip):

        # -----------------------------
        # USER VALIDATION
        # -----------------------------
        contractor = User.query.get(contractor_id)

        if not contractor:
            raise ValueError("User not found")

        if contractor.role != "CONTRACTOR":
            raise ValueError("Only contractors can submit bids")

        if not contractor.is_verified:
            raise ValueError("Account not verified")

        # Require at least one admin-verified document before bidding
        verified_docs = Document.query.filter_by(
            uploader_id=contractor_id,
            verification_status="verified"
        ).count()
        if verified_docs == 0:
            raise ValueError("No verified documents")

        # -----------------------------
        # TENDER VALIDATION
        # -----------------------------
        tender = TenderService.get(data["tender_id"])

        if not tender:
            raise ValueError("Tender not found")

        if TenderService.is_deadline_passed(tender):
            raise ValueError("Tender deadline has passed")

        if tender.status != "OPEN":
            raise ValueError("Tender is not open for bidding")

        if tender.employer_id == contractor_id:
            raise ValueError("You cannot bid on your own tender")

        # -----------------------------
        # MAXIMUM BID LIMIT
        # -----------------------------
        current_bid_count = Bid.query.filter_by(
            tender_id=data["tender_id"]
        ).count()

        if current_bid_count >= 10:
            raise ValueError(
                "This tender has reached the maximum number of bids"
            )

        # -----------------------------
        # DUPLICATE CHECK
        # -----------------------------
        if BidRepository.existing(
            data["tender_id"],
            contractor_id
        ):
            raise ValueError(
                "You already submitted a bid for this tender"
            )

        # -----------------------------
        # CREATE BID
        # -----------------------------
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
        db.session.flush()  # get bid.id before commit

        # -----------------------------
        # FRAUD SCORING
        # -----------------------------
        avg = db.session.query(
            func.avg(Bid.bid_amount)
        ).filter(
            Bid.tender_id == data["tender_id"],
            Bid.id != bid.id
        ).scalar() or 0

        other_ips = {
            b.submission_ip for b in Bid.query.filter(
                Bid.tender_id == data["tender_id"],
                Bid.id != bid.id
            ).all()
            if b.submission_ip
        }

        bid.fraud_score = _calculate_fraud_score(
            bid.bid_amount,
            avg,
            request_ip,
            other_ips
        )

        bid.is_flagged = bid.fraud_score >= 60

        db.session.commit()

        # Notify the employer that a new bid arrived
        try:
            NotificationService.notify(
                user_id=tender.employer_id,
                type="BID",
                message=f"New bid received on '{tender.title}'",
                link=f"/employer/tenders/{tender.id}/bids",
            )
        except Exception:
            pass  # notification failure must not block bid creation

        # -----------------------------
        # AUTO CLOSE + AUTO AWARD
        # -----------------------------
        updated_bid_count = Bid.query.filter_by(
            tender_id=data["tender_id"]
        ).count()

        if updated_bid_count >= 10:

            # Close and award automatically
            winner = TenderAutoAwardService.close_and_award(
                tender.id
            )

            return {
                "message": "Bid submitted successfully. Tender automatically closed and awarded.",
                "bid": bid,
                "winner": winner
            }

        # -----------------------------
        # NORMAL RESPONSE
        # -----------------------------
        return {
            "message": "Bid submitted successfully",
            "bid": bid
        }
            

        # -----------------------------
        # GET SINGLE BID
        # -----------------------------
    @staticmethod
    def get(bid_id):
        return BidRepository.get_by_id(bid_id)

    # -----------------------------
    # LIST CONTRACTOR BIDS
    # -----------------------------
    @staticmethod
    def list_mine(contractor_id):
        return BidRepository.list_by_contractor(contractor_id)

    # -----------------------------
    # LIST TENDER BIDS
    # -----------------------------
    @staticmethod
    def list_for_tender(tender_id):
        return BidRepository.list_by_tender(tender_id)

    # -----------------------------
    # LIST FLAGGED BIDS (ADMIN)
    # -----------------------------
    @staticmethod
    def list_flagged():
        return BidRepository.list_flagged()

    # -----------------------------
    # UPDATE BID (SAFE)
    # -----------------------------
    @staticmethod
    def update(bid, data, contractor_id):

        if bid.contractor_id != contractor_id:
            raise PermissionError("Only the bid owner can update")

        tender = TenderService.get(bid.tender_id)

        if tender and TenderService.is_deadline_passed(tender):
            raise ValueError("Cannot edit - tender deadline passed")

        # ONLY allow safe fields
        allowed_fields = {
            "bid_amount",
            "proposal_summary",
            "completion_months"
        }

        for key, value in data.items():
            if key in allowed_fields:
                setattr(bid, key, value)

        return BidRepository.update(bid)

    # -----------------------------
    # EMPLOYER VIEW: ALL BIDS
    # -----------------------------
    @staticmethod
    def list_employer_bids(employer_id):

        bids = (
            db.session.query(Bid)
            .join(Tender, Bid.tender_id == Tender.id)
            .filter(Tender.employer_id == employer_id)
            .all()
        )

        return bids