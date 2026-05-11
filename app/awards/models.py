from app.extensions import db
from datetime import datetime

class Award(db.Model):
    __tablename__ = 'awards'

    id = db.Column(db.Integer, primary_key=True)
    tender_id = db.Column(db.Integer, db.ForeignKey('tenders.id'), nullable=False)
    employer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    contractor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    letter_document_id = db.Column(db.Integer, db.ForeignKey('documents.id'), nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employer = db.relationship('User', foreign_keys=[employer_id], backref='issued_awards')
    contractor = db.relationship('User', foreign_keys=[contractor_id], backref='won_awards')

    def to_dict(self):
        return {
            'id': self.id,
            'tender_id': self.tender_id,
            'employer_id': self.employer_id,
            'contractor_id': self.contractor_id,
            'letter_document_id': self.letter_document_id,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
