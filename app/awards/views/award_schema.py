from marshmallow import Schema, fields, validate


class AwardResponseSchema(Schema):
    id = fields.Str()
    tender_id = fields.Str()
    bid_id = fields.Str()
    awarded_to = fields.Str()
    awarded_by = fields.Str()
    award_amount = fields.Float()
    status = fields.Str()
    letter_document_id = fields.Str(allow_none=True)
    created_at = fields.DateTime()


class AwardCreateSchema(Schema):
    tender_id = fields.Str(required=True)
    bid_id = fields.Str(required=True)
    awarded_to = fields.Str(required=True)
    award_amount = fields.Float(required=True, validate=validate.Range(min=0))


class AwardStatusUpdateSchema(Schema):
    status = fields.Str(required=True, validate=validate.OneOf(["ACCEPTED", "REJECTED"]))


award_response_schema = AwardResponseSchema()
awards_response_schema = AwardResponseSchema(many=True)
award_create_schema = AwardCreateSchema()
award_status_update_schema = AwardStatusUpdateSchema()
