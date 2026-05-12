# ============================================================
# Document MODEL — defines the "documents" table in the database.
# Each row in this table is metadata about one uploaded file.
# The actual file bytes live on disk in the uploads/ folder.
# ============================================================
from datetime import datetime
import uuid
from app.extensions import db


class Document(db.Model):
    # SQLAlchemy looks for __tablename__ to know what to call the DB table
    __tablename__ = "documents"

    # ----- PRIMARY KEY -----
    # UUID string — unique even across servers, never re-used.
    # Example: "e9ea7b30-1738-4fb3-ac6a-569514e75bcd"
    id = db.Column(
        db.String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),  # lambda = generate a new UUID per row
    )

    # ----- FILE INFO -----
    # The SAFE filename actually written to disk.
    # Format: 20260512_<uuid-hex>_<sanitized_name>.pdf
    # unique=True prevents two rows from claiming the same file on disk.
    stored_filename = db.Column(db.String(255), nullable=False, unique=True)

    # The ORIGINAL filename the user gave us (e.g. "John_CV.pdf").
    # Used when downloading — the file comes back with this name.
    original_filename = db.Column(db.String(255), nullable=False)

    # MIME type, e.g. "application/pdf" or "image/png"
    file_type = db.Column(db.String(100), nullable=False)

    # Size in bytes. Used to enforce the 10 MB limit.
    file_size = db.Column(db.Integer, nullable=False)

    # ----- DOCUMENT CATEGORY -----
    # One of: CV, PROPOSAL, TENDER_DOC, AWARD_LETTER
    # index=True makes "find all CVs" fast — O(log n) instead of O(n).
    document_type = db.Column(db.String(50), nullable=False, index=True)

    # ----- OWNERSHIP -----
    # UUID of the user who uploaded this. Indexed because "list MY docs"
    # is the most common query in the system.
    uploader_id = db.Column(db.String(36), nullable=False, index=True)

    # ----- OPTIONAL LINKS -----
    # If this doc belongs to a bid (e.g. CV attached to a bid), store bid_id.
    bid_id = db.Column(db.String(36), nullable=True, index=True)
    # If this doc belongs to a tender (e.g. tender requirements PDF), store tender_id.
    tender_id = db.Column(db.String(36), nullable=True, index=True)

    # ----- TIMESTAMP -----
    # Auto-filled with current UTC time when the row is created.
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
