from datetime import datetime
from app.extensions import db
from app.tenders.models.tender import Tender


class TenderRepository:
    @staticmethod
    def create(data):
        t = Tender(**data)
        db.session.add(t)
        db.session.commit()
        return t

    @staticmethod
    def get_by_id(tender_id):
        return db.session.get(Tender, tender_id)

    @staticmethod
    def list_all():
        return Tender.query.order_by(Tender.created_at.desc()).all()

    @staticmethod
    def list_active():
        return Tender.query.filter(Tender.deadline > datetime.utcnow()).order_by(Tender.deadline.asc()).all()

    @staticmethod
    def list_by_employer(employer_id):
        return Tender.query.filter_by(employer_id=employer_id).order_by(Tender.created_at.desc()).all()

    @staticmethod
    def search(keyword=None, category=None, min_budget=None, max_budget=None):
        q = Tender.query
        if keyword:
            q = q.filter(Tender.title.ilike(f"%{keyword}%"))
        if category:
            q = q.filter(Tender.category == category)
        if min_budget is not None:
            q = q.filter(Tender.budget >= min_budget)
        if max_budget is not None:
            q = q.filter(Tender.budget <= max_budget)
        return q.order_by(Tender.created_at.desc()).all()

    @staticmethod
    def update(tender):
        db.session.commit()
        return tender

    @staticmethod
    def delete(tender):
        db.session.delete(tender)
        db.session.commit()
