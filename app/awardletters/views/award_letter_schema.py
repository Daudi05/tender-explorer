from marshmallow import Schema, fields


class AwardLetterResponseSchema(Schema):
    id = fields.Str()
    tender_id = fields.Str()
    contractor_id = fields.Str()
    employer_id = fields.Str()
    original_filename = fields.Str()
    created_at = fields.DateTime()