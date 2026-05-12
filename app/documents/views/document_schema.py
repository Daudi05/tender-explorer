# ============================================================
# Marshmallow SCHEMAS — two jobs:
#   1. VALIDATE incoming requests (reject invalid data with a clear error)
#   2. SERIALIZE outgoing responses (turn Python objects into clean JSON)
# ============================================================
from marshmallow import Schema, fields, validate

# Only these 4 document types are allowed.
# Anything else triggers a 422 Unprocessable Entity error.
ALLOWED_DOCUMENT_TYPES = ["CV", "PROPOSAL", "TENDER_DOC", "AWARD_LETTER"]


class DocumentResponseSchema(Schema):
    """Shape of the JSON we send BACK to Postman after upload/list/get."""
    id = fields.Str()                               # UUID string
    original_filename = fields.Str()                # user's filename
    file_type = fields.Str()                        # MIME type
    file_size = fields.Int()                        # bytes
    document_type = fields.Str()                    # CV, PROPOSAL, etc.
    uploader_id = fields.Str()                      # owner's UUID
    bid_id = fields.Str(allow_none=True)            # nullable
    tender_id = fields.Str(allow_none=True)         # nullable
    created_at = fields.DateTime()                  # ISO-8601 timestamp


class DocumentUploadSchema(Schema):
    """Validates the FORM FIELDS that come with the upload (not the file itself)."""
    # document_type is REQUIRED and must be one of the 4 allowed values
    document_type = fields.Str(
        required=True,
        validate=validate.OneOf(ALLOWED_DOCUMENT_TYPES),
    )
    # bid_id is optional — only set when uploading a CV/proposal for a bid
    bid_id = fields.Str(required=False, allow_none=True)
    # tender_id is optional — only set when uploading a tender doc or award letter
    tender_id = fields.Str(required=False, allow_none=True)


# Pre-instantiate the schemas at import time.
# Marshmallow schema construction is expensive — reusing the same instance
# per request is way faster than building a new one each time.
document_response_schema = DocumentResponseSchema()                  # for 1 document
documents_response_schema = DocumentResponseSchema(many=True)        # for a list
document_upload_schema = DocumentUploadSchema()                      # for validation
