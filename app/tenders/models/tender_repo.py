from app.extensions import db

from app.tenders.models.tender import Tender


class TenderRepository:

    @staticmethod
    def create_tender(data):

        tender = Tender(**data)

        db.session.add(tender)

        db.session.commit()

        return tender

    @staticmethod
    def get_all_tenders(page, per_page, category=None):

        query = Tender.query.filter_by(is_deleted=False)

        if category:
            query = query.filter(
                Tender.category.ilike(f'%{category}%')
            )

        return query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

    @staticmethod
    def get_tender_by_uuid(uuid):

        return Tender.query.filter_by(
            uuid=uuid,
            is_deleted=False
        ).first()

    @staticmethod
    def update_tender(tender):

        db.session.commit()

        return tender

    @staticmethod
    def delete_tender(tender):

        tender.is_deleted = True

        db.session.commit()