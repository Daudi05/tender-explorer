from datetime import datetime
import uuid
from app.extensions import db

ROLE_EMPLOYER = "EMPLOYER"
ROLE_CONTRACTOR = "CONTRACTOR"
ROLE_ADMIN = "ADMIN"
ALLOWED_ROLES = [ROLE_EMPLOYER, ROLE_CONTRACTOR, ROLE_ADMIN]



class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=True, index=True)
    role = db.Column(db.String(20), nullable=False, index=True)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    verification_token = db.Column(db.String(255), nullable=True)
    reputation_score = db.Column(db.Float, default=100.0, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    last_login_ip = db.Column(db.String(45), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    
    bids = db.relationship(
        "Bid",
        back_populates="contractor",
        foreign_keys="Bid.contractor_id",
        lazy=True
    )
