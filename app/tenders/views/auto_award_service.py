from app.bids.views.evaluation_service import BidEvaluationService
from app.tenders.models.tender import Tender
from app import db


class TenderAutoAwardService:

    @staticmethod
    def close_and_award(tender_id):

        tender = Tender.query.get(tender_id)

        if not tender:
            raise ValueError("Tender not found")

        # Ensure tender is eligible
        if tender.status != "OPEN":
            raise ValueError("Tender already processed")

        #  CALL YOUR EXISTING LOGIC
        winner = BidEvaluationService.evaluate_tender(tender_id)

        db.session.commit()

        return winner