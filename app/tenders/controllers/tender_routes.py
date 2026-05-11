from flask import Blueprint

from app.tenders.views.tender_service import TenderService

tender_bp = Blueprint(
    'tender_bp',
    __name__
)

@tender_bp.route('/', methods=['POST'])
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