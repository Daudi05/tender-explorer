import secrets
from flask_jwt_extended import create_access_token
from app.extensions import bcrypt
from app.auth.models.user_repo import UserRepository
from app.auth.utils.auth_validators import is_strong_password, normalize_email


class AuthService:
    @staticmethod
    def register(data, request_ip=None):
        email = normalize_email(data["email"])
        if not is_strong_password(data["password"]):
            raise ValueError("Password must be 8+ chars with letter and number")
        if UserRepository.get_by_email(email):
            raise ValueError("Email already registered")

        token = secrets.token_urlsafe(32)
        user = UserRepository.create({
            "email": email,
            "password_hash": bcrypt.generate_password_hash(data["password"]).decode("utf-8"),
            "name": data["name"].strip(),
            "phone": data.get("phone"),
            "role": data["role"],
            "is_verified": True,
            "verification_token": token,
            "last_login_ip": request_ip,
        })
        return user, token

    @staticmethod
    def login(data, request_ip=None):
        email = normalize_email(data["email"])
        user = UserRepository.get_by_email(email)
        if not user or not bcrypt.check_password_hash(user.password_hash, data["password"]):
            raise ValueError("Invalid email or password")
        if not user.is_active:
            raise ValueError("Account deactivated")

        if request_ip:
            user.last_login_ip = request_ip
            UserRepository.update(user)

        token = create_access_token(
            identity=user.id,
            additional_claims={"role": user.role, "is_verified": user.is_verified},
        )
        return user, token

    @staticmethod
    def verify_email(token):
        user = UserRepository.get_by_token(token)
        if not user:
            return None
        user.is_verified = True
        user.verification_token = None
        UserRepository.update(user)
        return user

    @staticmethod
    def get_user(user_id):
        return UserRepository.get_by_id(user_id)
