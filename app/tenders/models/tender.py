import uuid
from datetime import datetime
from app.extensions import db

class Tender(db.Model):
    __tablename__ = 'tenders'

    id = db.Column(db.Integer, primary_key=True)

    uuid = db.Column(
        db.String(36),
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False
    )

    tender_code = db.Column(
        db.String(20),
        unique=True,
        nullable=False
    )

    title = db.Column(
        db.String(255),
        nullable=False
    )

    category = db.Column(
        db.String(100),
        nullable=False
    )

    company_name = db.Column(
        db.String(255),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=False
    )

    budget = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    completion_time = db.Column(
        db.Integer,
        nullable=False
    )

    image_url = db.Column(
        db.String(500),
        nullable=True
    )

    employer_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    is_deleted = db.Column(
        db.Boolean,
        default=False
    )

    def __repr__(self):
        return f'<Tender {self.title}>'