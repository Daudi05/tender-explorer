from datetime import datetime
import uuid

from app.extensions import db


class AwardLetter(db.Model):
    __tablename__ = "award_letters"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    tender_id = db.Column(db.String(36), db.ForeignKey("tenders.id"), nullable=False)
    contractor_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    employer_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)

    file_url = db.Column(db.String(255), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    # ================= RELATIONSHIPS =================

    tender = db.relationship(
        "Tender",
        backref="award_letters"
    )

    contractor = db.relationship(
        "User",
        foreign_keys=[contractor_id]
    )

    employer = db.relationship(
        "User",
        foreign_keys=[employer_id]
    )