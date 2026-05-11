from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.notifications.views.notification_service import NotificationService
from app.notifications.models.notification_repo import NotificationRepository
from app.notifications.views.notification_schema import (
    notification_response_schema,
    notifications_response_schema,
)

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


@notifications_bp.route("", methods=["GET"])
@jwt_required()
def list_my_notifications():
    notifs = NotificationService.list_mine(get_jwt_identity())
    return jsonify({"notifications": notifications_response_schema.dump(notifs)}), 200


@notifications_bp.route("/unread-count", methods=["GET"])
@jwt_required()
def unread_count():
    count = NotificationService.unread_count(get_jwt_identity())
    return jsonify({"unread_count": count}), 200


@notifications_bp.route("/<string:notif_id>/read", methods=["PATCH"])
@jwt_required()
def mark_read(notif_id):
    notif = NotificationRepository.get_by_id(notif_id)
    if not notif:
        return jsonify({"error": "Notification not found"}), 404

    try:
        notif = NotificationService.mark_read(notif, get_jwt_identity())
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403

    return jsonify({"notification": notification_response_schema.dump(notif)}), 200


@notifications_bp.route("/read-all", methods=["PATCH"])
@jwt_required()
def mark_all_read():
    NotificationService.mark_all_read(get_jwt_identity())
    return jsonify({"message": "All notifications marked as read"}), 200
