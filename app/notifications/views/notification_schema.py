from marshmallow import Schema, fields


class NotificationResponseSchema(Schema):
    id = fields.Str()
    user_id = fields.Str()
    message = fields.Str()
    link = fields.Str(allow_none=True)
    is_read = fields.Bool()
    created_at = fields.DateTime()


notification_response_schema = NotificationResponseSchema()
notifications_response_schema = NotificationResponseSchema(many=True)
