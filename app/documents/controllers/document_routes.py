# ============================================================
# HTTP layer for the Documents module.
# This file is "thin" — each route just:
#   1. Validates the incoming request
#   2. Calls the service to do the real work
#   3. Returns clean JSON back to Postman
# ============================================================
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.extensions import db
from app.documents.views.document_service import DocumentService
from app.documents.views.document_schema import (
    document_upload_schema,
    document_response_schema,
    documents_response_schema,
)

# `documents_bp` is the Blueprint object Flask uses to group routes.
# When app/__init__.py runs `app.register_blueprint(documents_bp)`,
# all routes below become available under /api/documents/...
documents_bp = Blueprint("documents", __name__, url_prefix="/api/documents")


# ============== POST /api/documents/upload ==============
# Uploads a CV, proposal, tender doc, or award letter.
# Expects multipart form-data (NOT JSON) because files are binary.
@documents_bp.route("/upload", methods=["POST"])
@jwt_required()  # User must be logged in (have a valid JWT)
def upload_document():
    # Step 1: Make sure a file was actually attached to the request
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    # Step 2: Validate the form fields (document_type, optional bid_id/tender_id).
    # Marshmallow rejects invalid document_type values like "RANDOM" with a 422.
    try:
        form_data = document_upload_schema.load(request.form.to_dict())
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    # Step 3: Hand the heavy lifting to the service layer.
    # The service validates file extension, size, generates a safe filename,
    # writes bytes to disk, and saves metadata to the DB.
    try:
        uploader_id = get_jwt_identity()  # Logged-in user's UUID
        doc = DocumentService.upload(request.files["file"], form_data, uploader_id)
    except ValueError as e:
        # Service raised because of: bad extension, oversized, or empty file
        return jsonify({"error": str(e)}), 400

    # Step 4: Return 201 Created with the new document's metadata
    return jsonify({
        "message": "Document uploaded successfully",
        "document": document_response_schema.dump(doc),
    }), 201


# ============== GET /api/documents/me ==============
# Lists every document the LOGGED-IN user has uploaded.
@documents_bp.route("/me", methods=["GET"])
@jwt_required()
def list_my_documents():
    # get_jwt_identity() returns the user_id stored when the token was issued.
    docs = DocumentService.list_mine(get_jwt_identity())
    return jsonify({"documents": documents_response_schema.dump(docs)}), 200


# ============== GET /api/documents/<id> ==============
# Returns ONLY metadata for one document (not the file bytes).
# Frontend uses this to show file info before deciding to download.
@documents_bp.route("/<string:doc_id>", methods=["GET"])
@jwt_required()
def get_document(doc_id):
    doc = DocumentService.get(doc_id)
    if not doc:
        # 404 = exists nowhere in the DB
        return jsonify({"error": "Document not found"}), 404
    return jsonify({"document": document_response_schema.dump(doc)}), 200


# ============== GET /api/documents/<id>/download ==============
# Streams the actual file bytes back as a download.
@documents_bp.route("/<string:doc_id>/download", methods=["GET"])
@jwt_required()
def download_document(doc_id):
    doc = DocumentService.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404

    # send_from_directory uses the kernel's sendfile() syscall on Linux —
    # zero-copy, fastest possible static-file delivery from Flask.
    return send_from_directory(
        current_app.config["UPLOAD_FOLDER"],
        doc.stored_filename,                  # the SAFE name on disk
        as_attachment=True,                   # browser downloads instead of displaying
        download_name=doc.original_filename,  # but saves with the user's original name
    )


# ============== DELETE /api/documents/<id> ==============
# Removes a document from disk AND the database.
# Only the original uploader can delete (security check is in the service).
@documents_bp.route("/<string:doc_id>", methods=["DELETE"])
@jwt_required()
def delete_document(doc_id):
    doc = DocumentService.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    try:
        DocumentService.delete(doc, get_jwt_identity())
    except PermissionError as e:
        # Service raised this because requester is not the owner
        return jsonify({"error": str(e)}), 403
    return jsonify({"message": "Document deleted"}), 200
