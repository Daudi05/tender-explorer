from marshmallow import Schema, fields, validate
from app.auth.models.user import ALLOWED_ROLES


class UserResponseSchema(Schema):
    id = fields.Str()
    email = fields.Email()
    name = fields.Str()
    phone = fields.Str(allow_none=True)
    role = fields.Str()
    is_verified = fields.Bool()
    reputation_score = fields.Float()
    is_active = fields.Bool()
    created_at = fields.DateTime()


class RegisterSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    name = fields.Str(required=True, validate=validate.Length(min=2, max=120))
    phone = fields.Str(required=False, allow_none=True)
    role = fields.Str(required=True, validate=validate.OneOf(ALLOWED_ROLES))


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)


user_response_schema = UserResponseSchema()
users_response_schema = UserResponseSchema(many=True)
register_schema = RegisterSchema()
login_schema = LoginSchema()
