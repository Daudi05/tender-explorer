from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.awards.models import Award
from app.notifications.models import Notification

awards_bp = Blueprint('awards', __name__)

@awards_bp.route('', methods=['POST'])
@jwt_required()
def create_award():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('tender_id') or not data.get('contractor_id'):
        return jsonify({'success': False, 'message': 'tender_id and contractor_id are required'}), 400

    award = Award(
        tender_id=data['tender_id'],
        employer_id=current_user_id,
        contractor_id=data['contractor_id']
    )
    db.session.add(award)
    db.session.flush()

    notification = Notification(
        user_id=data['contractor_id'],
        message=f'Congratulations! You have been awarded tender #{data["tender_id"]}.',
        award_id=award.id
    )
    db.session.add(notification)
    db.session.commit()

    return jsonify({'success': True, 'data': award.to_dict()}), 201


@awards_bp.route('/me/wins', methods=['GET'])
@jwt_required()
def my_wins():
    current_user_id = get_jwt_identity()
    awards = Award.query.filter_by(contractor_id=current_user_id).all()
    return jsonify({'success': True, 'data': [a.to_dict() for a in awards]}), 200


@awards_bp.route('/me/issued', methods=['GET'])
@jwt_required()
def my_issued():
    current_user_id = get_jwt_identity()
    awards = Award.query.filter_by(employer_id=current_user_id).all()
    return jsonify({'success': True, 'data': [a.to_dict() for a in awards]}), 200


@awards_bp.route('/<int:award_id>', methods=['GET'])
@jwt_required()
def get_award(award_id):
    award = Award.query.get_or_404(award_id)
    return jsonify({'success': True, 'data': award.to_dict()}), 200


@awards_bp.route('/<int:award_id>/status', methods=['PATCH'])
@jwt_required()
def update_status(award_id):
    current_user_id = get_jwt_identity()
    award = Award.query.get_or_404(award_id)

    if award.contractor_id != current_user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    data = request.get_json()
    status = data.get('status')
    if status not in ['accepted', 'rejected']:
        return jsonify({'success': False, 'message': 'Status must be accepted or rejected'}), 400

    award.status = status
    db.session.commit()
    return jsonify({'success': True, 'data': award.to_dict()}), 200


@awards_bp.route('/<int:award_id>/attach-letter', methods=['POST'])
@jwt_required()
def attach_letter(award_id):
    current_user_id = get_jwt_identity()
    award = Award.query.get_or_404(award_id)

    if award.employer_id != current_user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    data = request.get_json()
    letter_document_id = data.get('letter_document_id')
    if not letter_document_id:
        return jsonify({'success': False, 'message': 'letter_document_id is required'}), 400

    award.letter_document_id = letter_document_id
    db.session.commit()
    return jsonify({'success': True, 'data': award.to_dict()}), 200
