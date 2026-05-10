# This file uses Marshmallow to:
#   1. CHECK that incoming data from Postman is correct (validation)
#   2. FORMAT data going back to Postman as clean JSON (serialization)

from marshmallow import Schema, fields, validate

# Only these 4 document types are allowed.
# Anything else gets rejected with a 422 error.
ALLOWED_DOCUMENT_TYPES = ["CV", "PROPOSAL", "TENDER_DOC", "AWARD_LETTER"]


# Defines what JSON we send BACK to the user after they upload/list
class DocumentResponseSchema(Schema):
    id = fields.Str()
    original_filename = fields.Str()
    file_type = fields.Str()
    file_size = fields.Int()
    document_type = fields.Str()
    uploader_id = fields.Str()
    bid_id = fields.Str(allow_none=True)       # might be empty
    tender_id = fields.Str(allow_none=True)    # might be empty
    created_at = fields.DateTime()


# Defines what fields are required when uploading
class DocumentUploadSchema(Schema):
    # Must be one of the 4 allowed types, otherwise reject
    document_type = fields.Str(required=True, validate=validate.OneOf(ALLOWED_DOCUMENT_TYPES))
    # Optional: only if doc relates to a bid
    bid_id = fields.Str(required=False, allow_none=True)
    # Optional: only if doc relates to a tender
    tender_id = fields.Str(required=False, allow_none=True)


# Build the schemas ONCE here so the routes can reuse them.
# Building them every request would be slower.
document_response_schema = DocumentResponseSchema()           # for one document
documents_response_schema = DocumentResponseSchema(many=True) # for a list of documents
document_upload_schema = DocumentUploadSchema()               # for validating uploads
