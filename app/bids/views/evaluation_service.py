from datetime import datetime

from app.extensions import db
from app.bids.models.bid import Bid
from app.tenders.models.tender import Tender
from app.notifications.views.notification_service import NotificationService


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

        timed_bids = [b for b in bids if b.completion_months]
        fastest_time = min(b.completion_months for b in timed_bids) if timed_bids else None

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

            # COMPLETION TIME SCORE (skip if no bids have completion_months)
            time_score = (
                (fastest_time / bid.completion_months) * 20
                if fastest_time and bid.completion_months and bid.completion_months > 0 else 0
            )

            # FRAUD PENALTY (score is 0–100 scale)
            fraud_penalty = (
                bid.fraud_score / 10
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

            # AUTO FLAG FRAUD (score is 0–100 scale, flag at 60+)
            if bid.fraud_score >= 60:
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

        # Fire notifications — winner and losers
        if winning_bid:
            try:
                NotificationService.notify(
                    user_id=winning_bid.contractor_id,
                    type="AWARD",
                    message=f"Congratulations! You won the tender: {tender.title}",
                    link="/contractor/my-awards",
                )
                for bid in bids:
                    if bid.id != winning_bid.id:
                        NotificationService.notify(
                            user_id=bid.contractor_id,
                            type="TENDER",
                            message=f"Tender '{tender.title}' has been awarded to another bidder.",
                            link="/contractor/browse",
                        )
            except Exception:
                pass  # notification failure must not roll back the award

        return winning_bid