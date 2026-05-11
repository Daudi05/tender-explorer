import random
import string
from flask import request
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity

from app.tenders.models.tender_repo import TenderRepository

from app.tenders.views.tender_schema import (
    single_tender_schema,
    multiple_tender_schema
)

class TenderService:

    @staticmethod
    def generate_tender_code():

        letters = ''.join(
            random.choices(string.ascii_uppercase, k=2)
        )

        numbers = ''.join(
            random.choices(string.digits, k=4)
        )

        return f'{letters}{numbers}'

    @staticmethod
    @jwt_required()
    def create_tender():

        data = request.get_json()

        errors = single_tender_schema.validate(data)

        if errors:
            return {
                'errors': errors
            }, 400

        data['tender_code'] = TenderService.generate_tender_code()

        data['employer_id'] = get_jwt_identity()

        tender = TenderRepository.create_tender(data)

        return {
            'message': 'Tender successfully created',
            'tender': single_tender_schema.dump(tender)
        }, 201
    
    @staticmethod
    def get_all_tenders():

        page = request.args.get(
            'page',
            1,
            type=int
        )

        per_page = request.args.get(
            'per_page',
            10,
            type=int
        )

        category = request.args.get('category')

        tenders = TenderRepository.get_all_tenders(
            page,
            per_page,
            category
        )

        return {
            'current_page': tenders.page,
            'total_pages': tenders.pages,
            'total_tenders': tenders.total,
            'data': multiple_tender_schema.dump(
                tenders.items
            )
        }, 200

    @staticmethod
    def get_single_tender(uuid):

        tender = TenderRepository.get_tender_by_uuid(uuid)

        if not tender:
            return {
                'error': 'Tender not found'
            }, 404

        return {
            'tender': single_tender_schema.dump(tender)
        }, 200
    
    @staticmethod
    @jwt_required()
    def update_tender(uuid):

        tender = TenderRepository.get_tender_by_uuid(uuid)

        if not tender:
            return {
                'error': 'Tender not found'
            }, 404

        data = request.get_json()

        errors = single_tender_schema.validate(
            data,
            partial=True
        )

        if errors:
            return {
                'errors': errors
            }, 400

        tender.title = data.get(
            'title',
            tender.title
        )

        tender.category = data.get(
            'category',
            tender.category
        )

        tender.company_name = data.get(
            'company_name',
            tender.company_name
        )

        tender.description = data.get(
            'description',
            tender.description
        )

        tender.budget = data.get(
            'budget',
            tender.budget
        )
        tender.completion_time = data.get(
            'completion_time',
            tender.completion_time
        )

        tender.image_url = data.get(
            'image_url',
            tender.image_url
        )

        updated_tender = TenderRepository.update_tender(tender)

        return {
            'message': 'Tender updated successfully',
            'tender': single_tender_schema.dump(
                updated_tender
            )
        }, 200
    @staticmethod
    @jwt_required()
    def delete_tender(uuid):

        tender = TenderRepository.get_tender_by_uuid(uuid)

        if not tender:
            return {
                'error': 'Tender not found'
            }, 404

        TenderRepository.delete_tender(tender)

        return {
            'message': 'Tender successfully deleted'
        }, 200