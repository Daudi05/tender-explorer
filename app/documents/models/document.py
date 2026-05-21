# ============================================================
# Document MODEL — defines the "documents" table.
# v2: added verification_status for admin review of uploaded
# business certificates (anti-fraud item #6 from David's spec).
# ============================================================
from datetime import datetime
import uuid
from app.extensions import db


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    stored_filename = db.Column(db.String(255), nullable=False, unique=True)
    original_filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(100), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    document_type = db.Column(db.String(50), nullable=False, index=True)
    uploader_id = db.Column(db.String(36), nullable=False, index=True)
    bid_id = db.Column(db.String(36), nullable=True, index=True)
    tender_id = db.Column(db.String(36), nullable=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # ---- v2 ANTI-FRAUD: admin verification ----
    # Values: pending | verified | rejected
    # Admins review uploaded business certificates, IDs, licenses
    # and mark them as verified or rejected. Indexed for fast
    # "show me all pending docs" queries.
    verification_status = db.Column(
        db.String(20),
        default="pending",
        nullable=False,
        index=True,
    )

    uploader = db.relationship(
        "User",
        primaryjoin="Document.uploader_id == User.id",
        foreign_keys="[Document.uploader_id]",
        lazy="select",
    )
