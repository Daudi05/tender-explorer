from app.extensions import db
from app.auth.models.user import User


class UserRepository:
    @staticmethod
    def create(data):
        user = User(**data)
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def get_by_id(user_id):
        return db.session.get(User, user_id)

    @staticmethod
    def get_by_email(email):
        return User.query.filter_by(email=email.lower().strip()).first()

    @staticmethod
    def get_by_token(token):
        return User.query.filter_by(verification_token=token).first()

    @staticmethod
    def list_admins():
        return User.query.filter_by(role="ADMIN").all()

    @staticmethod
    def update(user):
        db.session.commit()
        return user
