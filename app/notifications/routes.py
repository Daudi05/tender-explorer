from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.notifications.models import Notification

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    current_user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=current_user_id).order_by(Notification.created_at.desc()).all()
    return jsonify({'success': True, 'data': [n.to_dict() for n in notifications]}), 200


@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def unread_count():
    current_user_id = get_jwt_identity()
    count = Notification.query.filter_by(user_id=current_user_id, is_read=False).count()
    return jsonify({'success': True, 'unread_count': count}), 200


@notifications_bp.route('/<int:notif_id>/read', methods=['PATCH'])
@jwt_required()
def mark_one_read(notif_id):
    current_user_id = get_jwt_identity()
    notif = Notification.query.get_or_404(notif_id)

    if notif.user_id != current_user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    notif.is_read = True
    db.session.commit()
    return jsonify({'success': True, 'data': notif.to_dict()}), 200


@notifications_bp.route('/read-all', methods=['PATCH'])
@jwt_required()
def mark_all_read():
    current_user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=current_user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'success': True, 'message': 'All notifications marked as read'}), 200
