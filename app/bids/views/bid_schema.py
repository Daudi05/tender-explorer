from marshmallow import Schema, fields, validate


class BidResponseSchema(Schema):
    id = fields.Str()
    tender_id = fields.Str()
    contractor_id = fields.Str()
    contractor_name = fields.Method("get_contractor_name")
    bid_amount = fields.Float()
    proposal_summary = fields.Str(allow_none=True)
    completion_months = fields.Int(allow_none=True)
    status = fields.Str()
    fraud_score = fields.Float()
    is_flagged = fields.Bool()
    is_winner = fields.Bool()
    evaluation_score = fields.Float()
    created_at = fields.DateTime()

    def get_contractor_name(self, obj):
        try:
            return obj.contractor.name if obj.contractor else None
        except Exception:
            return None


class BidCreateSchema(Schema):
    tender_id = fields.Str(required=True)
    bid_amount = fields.Float(required=True, validate=validate.Range(min=0))
    proposal_summary = fields.Str(required=False, allow_none=True)
    completion_months = fields.Int(required=False, allow_none=True, validate=validate.Range(min=1))


class BidUpdateSchema(Schema):
    bid_amount = fields.Float(validate=validate.Range(min=0))
    proposal_summary = fields.Str(allow_none=True)
    completion_months = fields.Int(allow_none=True, validate=validate.Range(min=1))


bid_response_schema = BidResponseSchema()
bids_response_schema = BidResponseSchema(many=True)
bid_create_schema = BidCreateSchema()
bid_update_schema = BidUpdateSchema()
