from marshmallow import fields

from app.extensions import ma

class TenderSchema(ma.Schema):

    uuid = fields.String(dump_only=True)

    tender_code = fields.String(dump_only=True)

    title = fields.String(required=True)

    category = fields.String(required=True)

    company_name = fields.String(required=True)

    description = fields.String(required=True)

    budget = fields.Decimal(required=True)

    completion_time = fields.Integer(required=True)

    image_url = fields.String()

    employer_id = fields.Integer(dump_only=True)

    created_at = fields.DateTime(dump_only=True)


single_tender_schema = TenderSchema()

multiple_tender_schema = TenderSchema(many=True)