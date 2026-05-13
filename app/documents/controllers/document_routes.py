# ============================================================
# HTTP layer for documents.
# v2: added PATCH /<id>/verify (admin verification workflow).
# ============================================================
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.extensions import db
from app.middleware.role_middleware import role_required
from app.documents.views.document_service import DocumentService
from app.documents.views.document_schema import (
    document_upload_schema,
    document_response_schema,
    documents_response_schema,
    document_verify_schema,  # v2
)

documents_bp = Blueprint("documents", __name__, url_prefix="/api/documents")


@documents_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_document():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    try:
        form_data = document_upload_schema.load(request.form.to_dict())
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422
    try:
        doc = DocumentService.upload(request.files["file"], form_data, get_jwt_identity())
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({
        "message": "Document uploaded successfully",
        "document": document_response_schema.dump(doc),
    }), 201


@documents_bp.route("/me", methods=["GET"])
@jwt_required()
def list_my_documents():
    docs = DocumentService.list_mine(get_jwt_identity())
    return jsonify({"documents": documents_response_schema.dump(docs)}), 200


@documents_bp.route("/<string:doc_id>", methods=["GET"])
@jwt_required()
def get_document(doc_id):
    doc = DocumentService.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    return jsonify({"document": document_response_schema.dump(doc)}), 200


@documents_bp.route("/<string:doc_id>/download", methods=["GET"])
@jwt_required()
def download_document(doc_id):
    doc = DocumentService.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    return send_from_directory(
        current_app.config["UPLOAD_FOLDER"],
        doc.stored_filename,
        as_attachment=True,
        download_name=doc.original_filename,
    )


@documents_bp.route("/<string:doc_id>", methods=["DELETE"])
@jwt_required()
def delete_document(doc_id):
    doc = DocumentService.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    try:
        DocumentService.delete(doc, get_jwt_identity())
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403
    return jsonify({"message": "Document deleted"}), 200


# ============== v2: PATCH /api/documents/<id>/verify ==============
# Admin-only document verification. Closes anti-fraud item #6.
@documents_bp.route("/<string:doc_id>/verify", methods=["PATCH"])
@jwt_required()
@role_required("ADMIN")
def verify_document(doc_id):
    """Mark a document as pending | verified | rejected (admin review)."""
    doc = DocumentService.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404

    try:
        data = document_verify_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    doc.verification_status = data["verification_status"]
    db.session.commit()

    return jsonify({
        "message": f"verification_status set to {data['verification_status']}",
        "document": document_response_schema.dump(doc),
    }), 200
