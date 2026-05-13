from app.extensions import db
from app.awards.models.award import Award


class AwardRepository:
    @staticmethod
    def create(data):
        award = Award(**data)
        db.session.add(award)
        db.session.commit()
        return award

    @staticmethod
    def get_by_id(award_id):
        return db.session.get(Award, award_id)

    @staticmethod
    def list_won_by(user_id):
        return Award.query.filter_by(awarded_to=user_id).order_by(Award.created_at.desc()).all()

    @staticmethod
    def list_given_by(user_id):
        return Award.query.filter_by(awarded_by=user_id).order_by(Award.created_at.desc()).all()

    @staticmethod
    def update_status(award, status):
        award.status = status
        db.session.commit()
        return award

    @staticmethod
    def attach_letter(award, document_id):
        award.letter_document_id = document_id
        db.session.commit()
        return award
