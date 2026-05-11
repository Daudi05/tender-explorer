from app.extensions import db
from app.notifications.models.notification import Notification


class NotificationRepository:
    @staticmethod
    def create(data):
        notif = Notification(**data)
        db.session.add(notif)
        db.session.commit()
        return notif

    @staticmethod
    def get_by_id(notif_id):
        return db.session.get(Notification, notif_id)

    @staticmethod
    def list_for_user(user_id):
        return Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()

    @staticmethod
    def count_unread(user_id):
        return Notification.query.filter_by(user_id=user_id, is_read=False).count()

    @staticmethod
    def mark_read(notif):
        notif.is_read = True
        db.session.commit()
        return notif

    @staticmethod
    def mark_all_read(user_id):
        Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
        db.session.commit()
