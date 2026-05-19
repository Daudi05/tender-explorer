from datetime import datetime
from marshmallow import Schema, fields, validate, validates, ValidationError


class TenderResponseSchema(Schema):
    id = fields.Str()
    title = fields.Str()
    description = fields.Str()
    category = fields.Str()
    budget = fields.Float()
    deadline = fields.DateTime()
    employer_id = fields.Str()
    status = fields.Str()
    winning_bid_id = fields.Str(allow_none=True)
    awarded_at = fields.DateTime(allow_none=True)
    created_at = fields.DateTime()


class TenderCreateSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=3, max=200))
    description = fields.Str(required=True, validate=validate.Length(min=10))
    category = fields.Str(required=True)
    budget = fields.Float(required=True, validate=validate.Range(min=0))
    deadline = fields.DateTime(required=True)

    @validates("deadline")
    def deadline_future(self, value, **kwargs):
        if value <= datetime.utcnow():
            raise ValidationError("Deadline must be in the future")


class TenderUpdateSchema(Schema):
    title = fields.Str(validate=validate.Length(min=3, max=200))
    description = fields.Str(validate=validate.Length(min=10))
    category = fields.Str()
    budget = fields.Float(validate=validate.Range(min=0))
    deadline = fields.DateTime()
    status = fields.Str(validate=validate.OneOf(["OPEN", "CLOSED", "AWARDED"]))
    winning_bid_id = fields.Str(allow_none=True)


tender_response_schema = TenderResponseSchema()
tenders_response_schema = TenderResponseSchema(many=True)
tender_create_schema = TenderCreateSchema()
tender_update_schema = TenderUpdateSchema()
