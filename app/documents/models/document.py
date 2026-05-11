# This file describes the "documents" table in the database.
# Each row in this table is one uploaded file's INFO (not the file itself).
# The actual file (PDF, DOCX, etc.) is saved on disk in the uploads/ folder.

from datetime import datetime
import uuid
from app.extensions import db


class Document(db.Model):
    # The real name of the database table
    __tablename__ = "documents"

    # A unique random ID for each document (like a fingerprint).
    # Example: "e9ea7b30-1738-4fb3-ac6a-569514e75bcd"
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # The safe filename we save on disk. Looks like: 20260509_xxxxx_test.pdf
    # Must be unique so two users uploading "cv.pdf" don't overwrite each other.
    stored_filename = db.Column(db.String(255), nullable=False, unique=True)

    # What the user CALLED the file when they uploaded it (e.g. "John_CV.pdf").
    # Used when they download it later — they get back their own filename.
    original_filename = db.Column(db.String(255), nullable=False)

    # The kind of file (e.g. "application/pdf", "image/png")
    file_type = db.Column(db.String(100), nullable=False)

    # How big the file is, in bytes
    file_size = db.Column(db.Integer, nullable=False)

    # What this document is for: CV, PROPOSAL, TENDER_DOC, or AWARD_LETTER.
    # "index=True" makes searching by type faster.
    document_type = db.Column(db.String(50), nullable=False, index=True)

    # Who uploaded this file (their user ID).
    # "index=True" makes "show me all my documents" a fast query.
    uploader_id = db.Column(db.String(36), nullable=False, index=True)

    # If this doc belongs to a bid, link it here. Otherwise empty.
    bid_id = db.Column(db.String(36), nullable=True, index=True)

    # If this doc belongs to a tender, link it here. Otherwise empty.
    tender_id = db.Column(db.String(36), nullable=True, index=True)

    # When the file was uploaded (auto-filled with current time)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
