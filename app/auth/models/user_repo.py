from app.extensions import db
from app.auth.models.user import User

def get_user_by_email(email):
    return User.query.filter_by(email=email.lower().strip()).first()

def get_user_by_id(user_id):
    return User.query.get(user_id)

def create_user(first_name, last_name, email, password, role="contractor"):
    user = User(
        first_name=first_name.strip(),
        last_name=last_name.strip(),
        email=email.lower().strip(),
        role=role
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return user