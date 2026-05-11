# This file defines the WEB ENDPOINTS (the URLs Postman talks to).
# Each route is small: it just reads the request, calls the service, returns JSON.
# All real work happens in DocumentService.

from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.documents.views.document_service import DocumentService
from app.documents.views.document_schema import (
    document_upload_schema,
    document_response_schema,
    documents_response_schema,
)

# Group all document routes under /api/documents
documents_bp = Blueprint("documents", __name__, url_prefix="/api/documents")


# ============== POST /api/documents/upload ==============
# Upload a file (CV, proposal, etc.)
@documents_bp.route("/upload", methods=["POST"])
@jwt_required()  # must be logged in
def upload_document():
    # Step 1: did they attach a file?
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    # Step 2: validate the text fields (document_type, etc.)
    try:
        form_data = document_upload_schema.load(request.form.to_dict())
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    # Step 3: hand it to the service to do the actual work
    try:
        uploader_id = get_jwt_identity()  # who is logged in
        doc = DocumentService.upload(request.files["file"], form_data, uploader_id)
    except ValueError as e:
        # File too big, wrong type, etc.
        return jsonify({"error": str(e)}), 400

    # Success! Return 201 Created with the document info
    return jsonify({
        "message": "Document uploaded successfully",
        "document": document_response_schema.dump(doc),
    }), 201


# ============== GET /api/documents/me ==============
# List all documents the logged-in user has uploaded
@documents_bp.route("/me", methods=["GET"])
@jwt_required()
def list_my_documents():
    docs = DocumentService.list_mine(get_jwt_identity())
    return jsonify({"documents": documents_response_schema.dump(docs)}), 200


# ============== GET /api/documents/<id> ==============
# Get the INFO about one document (not the actual file)
@documents_bp.route("/<string:doc_id>", methods=["GET"])
@jwt_required()
def get_document(doc_id):
    doc = DocumentService.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    return jsonify({"document": document_response_schema.dump(doc)}), 200


# ============== GET /api/documents/<id>/download ==============
# Download the actual file (the PDF, DOCX, etc.)
@documents_bp.route("/<string:doc_id>/download", methods=["GET"])
@jwt_required()
def download_document(doc_id):
    doc = DocumentService.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    # send_from_directory streams the file efficiently
    return send_from_directory(
        current_app.config["UPLOAD_FOLDER"],
        doc.stored_filename,
        as_attachment=True,                       # browser will download, not display
        download_name=doc.original_filename,      # save with the original name
    )


# ============== DELETE /api/documents/<id> ==============
# Delete a document (only the owner can)
@documents_bp.route("/<string:doc_id>", methods=["DELETE"])
@jwt_required()
def delete_document(doc_id):
    doc = DocumentService.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    try:
        DocumentService.delete(doc, get_jwt_identity())
    except PermissionError as e:
        # Tried to delete someone else's file
        return jsonify({"error": str(e)}), 403
    return jsonify({"message": "Document deleted"}), 200
