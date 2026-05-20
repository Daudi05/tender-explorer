from app.awardletters.models.award_letter import AwardLetter


class AwardLetterRepository:

    @staticmethod
    def create(data):

        award_letter = AwardLetter(**data)

        return award_letter


    @staticmethod
    def get_by_id(award_letter_id):

        return AwardLetter.query.get(award_letter_id)


    @staticmethod
    def list_by_contractor(contractor_id):

        return AwardLetter.query.filter_by(
            contractor_id=contractor_id
        ).all()