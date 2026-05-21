from app.extensions import db
from app.awardletters.models.award_letter_repo import (
    AwardLetterRepository
)


class AwardLetterService:

    @staticmethod
    def create_award_letter(data):

        award_letter = AwardLetterRepository.create(data)

        db.session.add(award_letter)
        db.session.commit()

        return award_letter