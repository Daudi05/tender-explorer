from datetime import datetime
import uuid
from app.extensions import db


class Tender(db.Model):
    __tablename__ = "tenders"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)
    budget = db.Column(db.Float, nullable=False)
    deadline = db.Column(db.DateTime, nullable=False, index=True)
    employer_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    status = db.Column(db.String(20), default="OPEN", nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    winning_bid_id = db.Column(db.String(36), db.ForeignKey("bids.id"), nullable=True)
    awarded_at = db.Column(db.DateTime, nullable=True)

    employer = db.relationship("User", backref="tenders", lazy=True)

    # ✅ FIXED relationship (this is the key fix)
    bids = db.relationship(
        "Bid",
        foreign_keys="Bid.tender_id",
        back_populates="tender",
        lazy=True,
        cascade="all, delete-orphan"
    )

    winning_bid = db.relationship(
        "Bid",
        foreign_keys=[winning_bid_id],
        lazy=True,
        post_update=True
    )