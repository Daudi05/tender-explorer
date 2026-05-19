# ============================================================
# Marshmallow schemas — validation + serialization.
# v2: added verification_status to response, new verify schema.
# ============================================================
from marshmallow import Schema, fields, validate

ALLOWED_DOCUMENT_TYPES = ["CV", "PROPOSAL", "TENDER_DOC", "AWARD_LETTER"]
VERIFICATION_STATUSES = ["pending", "verified", "rejected"]  # v2


class DocumentResponseSchema(Schema):
    """JSON sent back after upload/list/get."""
    id = fields.Str()
    original_filename = fields.Str()
    file_type = fields.Str()
    file_size = fields.Int()
    document_type = fields.Str()
    uploader_id = fields.Str()
    uploader_name = fields.Method("get_uploader_name")
    bid_id = fields.Str(allow_none=True)
    tender_id = fields.Str(allow_none=True)
    created_at = fields.DateTime()
    verification_status = fields.Str()  # v2

    def get_uploader_name(self, obj):
        try:
            return obj.uploader.name if obj.uploader else None
        except Exception:
            return None


class DocumentUploadSchema(Schema):
    """Validates form fields on upload."""
    document_type = fields.Str(
        required=True,
        validate=validate.OneOf(ALLOWED_DOCUMENT_TYPES),
    )
    bid_id = fields.Str(required=False, allow_none=True)
    tender_id = fields.Str(required=False, allow_none=True)


# v2: validates PATCH /<id>/verify body
class DocumentVerifySchema(Schema):
    verification_status = fields.Str(
        required=True,
        validate=validate.OneOf(VERIFICATION_STATUSES),
    )


document_response_schema = DocumentResponseSchema()
documents_response_schema = DocumentResponseSchema(many=True)
document_upload_schema = DocumentUploadSchema()
document_verify_schema = DocumentVerifySchema()  # v2
