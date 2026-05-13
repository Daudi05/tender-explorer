from datetime import datetime

from app.extensions import db
from app.bids.models.bid import Bid
from app.tenders.models.tender import Tender


class BidEvaluationService:

    @staticmethod
    def evaluate_tender(tender_id):

        tender = Tender.query.get(tender_id)

        if not tender:
            raise ValueError("Tender not found")

        if tender.status != "OPEN":
            raise ValueError("Tender is not open")

        bids = Bid.query.filter_by(
            tender_id=tender_id
        ).all()

        if not bids:
            raise ValueError("No bids found")

        lowest_bid = min(
            bid.bid_amount for bid in bids
        )

        fastest_time = min(
            bid.completion_months
            for bid in bids
            if bid.completion_months
        )

        highest_score = 0
        winning_bid = None

        for bid in bids:

            contractor = bid.contractor

            # PRICE SCORE
            price_score = (
                lowest_bid / bid.bid_amount
            ) * 40

            # REPUTATION SCORE
            reputation_score = (
                contractor.reputation_score / 100
            ) * 30

            # COMPLETION TIME SCORE
            time_score = (
                fastest_time / bid.completion_months
            ) * 20

            # FRAUD PENALTY
            fraud_penalty = (
                bid.fraud_score * 10
            )

            # FINAL SCORE
            final_score = (
                price_score
                + reputation_score
                + time_score
                - fraud_penalty
            )

            bid.evaluation_score = round(
                final_score,
                2
            )

            # AUTO FLAG FRAUD
            if bid.fraud_score >= 0.7:
                bid.is_flagged = True

            # SELECT WINNER
            if final_score > highest_score:
                highest_score = final_score
                winning_bid = bid

        # MARK WINNER
        if winning_bid:

            winning_bid.is_winner = True
            winning_bid.status = "AWARDED"

            tender.winning_bid_id = winning_bid.id
            tender.status = "AWARDED"
            tender.awarded_at = datetime.utcnow()

            # REJECT OTHER BIDS
            for bid in bids:

                if bid.id != winning_bid.id:
                    bid.status = "REJECTED"

        db.session.commit()

        return winning_bid