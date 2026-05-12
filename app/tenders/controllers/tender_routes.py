from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.middleware.role_middleware import role_required

from app.tenders.views.tender_service import TenderService

tender_bp = Blueprint(
    'tender_bp',
    __name__
)

@tender_bp.route('/', methods=['POST'])
@jwt_required()
@role_required("employer")
def create_tender():
    return TenderService.create_tender()


@tender_bp.route('/', methods=['GET'])
def get_all_tenders():
    return TenderService.get_all_tenders()


@tender_bp.route('/<string:uuid>', methods=['GET'])
def get_single_tender(uuid):
    return TenderService.get_single_tender(uuid)


@tender_bp.route('/<string:uuid>', methods=['PUT'])
def update_tender(uuid):
    return TenderService.update_tender(uuid)


@tender_bp.route('/<string:uuid>', methods=['DELETE'])
def delete_tender(uuid):
    return TenderService.delete_tender(uuid)