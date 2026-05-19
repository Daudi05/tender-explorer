from app.awards.models.award_repo import AwardRepository
from app.notifications.views.notification_service import NotificationService


class AwardService:
    @staticmethod
    def create_award(data, awarded_by):
        award = AwardRepository.create({
            **data,
            "awarded_by": awarded_by,
            "status": "ISSUED",
        })
        NotificationService.notify(
            user_id=data["awarded_to"],
            type="AWARD",
            message=f"Congratulations! You won a contract worth KES {data['award_amount']:,.0f}",
            link="/contractor/my-awards",
        )
        return award

    @staticmethod
    def get(award_id):
        return AwardRepository.get_by_id(award_id)

    @staticmethod
    def list_my_wins(user_id):
        return AwardRepository.list_won_by(user_id)

    @staticmethod
    def list_my_issued(user_id):
        return AwardRepository.list_given_by(user_id)

    @staticmethod
    def update_status(award, new_status, requester_id):
        if award.awarded_to != requester_id:
            raise PermissionError("Only the awarded contractor can change this status")
        return AwardRepository.update_status(award, new_status)

    @staticmethod
    def attach_letter(award, document_id):
        return AwardRepository.attach_letter(award, document_id)
