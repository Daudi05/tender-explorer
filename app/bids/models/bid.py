from datetime import datetime
import uuid
from app.extensions import db


class Bid(db.Model):
    __tablename__ = "bids"
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tender_id = db.Column(db.String(36), nullable=False, index=True)
    contractor_id = db.Column(db.String(36), nullable=False, index=True)
    bid_amount = db.Column(db.Float, nullable=False)
    proposal_summary = db.Column(db.Text, nullable=True)
    completion_months = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(20), default="SUBMITTED", nullable=False, index=True)
    submission_ip = db.Column(db.String(45), nullable=True, index=True)
    fraud_score = db.Column(db.Float, default=0.0, nullable=False, index=True)
    is_flagged = db.Column(db.Boolean, default=False, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    tender = db.relationship("Tender", backref="bids", lazy=True)
    contractor = db.relationship("User", backref="bids", lazy=True)
