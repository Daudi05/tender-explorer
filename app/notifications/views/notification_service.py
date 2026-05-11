from app.notifications.models.notification_repo import NotificationRepository


class NotificationService:
    @staticmethod
    def notify(user_id, message, link=None):
        return NotificationRepository.create({
            "user_id": user_id,
            "message": message,
            "link": link,
        })

    @staticmethod
    def list_mine(user_id):
        return NotificationRepository.list_for_user(user_id)

    @staticmethod
    def unread_count(user_id):
        return NotificationRepository.count_unread(user_id)

    @staticmethod
    def mark_read(notif, requester_id):
        if notif.user_id != requester_id:
            raise PermissionError("Cannot mark someone else's notification as read")
        return NotificationRepository.mark_read(notif)

    @staticmethod
    def mark_all_read(user_id):
        NotificationRepository.mark_all_read(user_id)
