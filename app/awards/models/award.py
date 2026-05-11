from datetime import datetime
import uuid
from app.extensions import db


class Award(db.Model):
    __tablename__ = "awards"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tender_id = db.Column(db.String(36), nullable=False, index=True)
    bid_id = db.Column(db.String(36), nullable=False, index=True)
    awarded_to = db.Column(db.String(36), nullable=False, index=True)
    awarded_by = db.Column(db.String(36), nullable=False)
    award_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False, default="ISSUED")
    letter_document_id = db.Column(db.String(36), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
