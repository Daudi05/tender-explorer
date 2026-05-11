# This file is the "Service". It contains the BUSINESS RULES:
#   - Is this file allowed?
#   - Is it too big?
#   - What unique name should we save it as?
#   - Save it to disk + tell the repository to save info to the DB.
# The routes don't know HOW any of this works — they just call DocumentService.upload().

import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import current_app
from app.documents.models.document_repo import DocumentRepository

# These are the only file types we accept. A "set" lookup is fastest.
ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "jpg", "jpeg", "png"}

# Maximum file size: 10 megabytes (10 * 1024 KB * 1024 bytes)
MAX_FILE_SIZE = 10 * 1024 * 1024


class DocumentService:

    # ---------- private helpers (start with _ by convention) ----------

    @staticmethod
    def _get_extension(filename):
        # Get the part after the LAST dot, lowercased.
        # Example: "MyFile.PDF" -> "pdf"
        return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    @staticmethod
    def _is_allowed(filename):
        # True if the extension is in our whitelist
        return DocumentService._get_extension(filename) in ALLOWED_EXTENSIONS

    @staticmethod
    def _build_unique_name(original_filename):
        # Build a filename that can't collide with anyone else's.
        # Format:  TIMESTAMP_RANDOMHEX_originalname.ext
        # Example: 20260509212230_a1b2c3d4..._my_cv.pdf
        ext = DocumentService._get_extension(original_filename)
        # secure_filename strips dangerous characters like ../, /, etc.
        safe_base = secure_filename(original_filename.rsplit(".", 1)[0])[:50] or "file"
        ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        return f"{ts}_{uuid.uuid4().hex}_{safe_base}.{ext}"

    # ---------- public methods (called by the routes) ----------

    @staticmethod
    def upload(file, form_data, uploader_id):
        # CHECK 1: did the user actually attach a file?
        if file is None or file.filename == "":
            raise ValueError("No file provided")

        # CHECK 2: is the extension allowed?
        if not DocumentService._is_allowed(file.filename):
            raise ValueError("File type not allowed")

        # CHECK 3: how big is the file?
        # Trick: jump to the end of the stream, ask "what position am I at?",
        # that's the size. Then jump back to the start so save() works.
        # This is faster than reading the whole file into memory.
        file.stream.seek(0, os.SEEK_END)
        size = file.stream.tell()
        file.stream.seek(0)

        if size == 0:
            raise ValueError("Empty file")
        if size > MAX_FILE_SIZE:
            raise ValueError("File too large. Max 10 MB")

        # Make sure the uploads/ folder exists
        upload_folder = current_app.config["UPLOAD_FOLDER"]
        os.makedirs(upload_folder, exist_ok=True)

        # Build a safe, unique filename and save the file to disk
        stored_name = DocumentService._build_unique_name(file.filename)
        full_path = os.path.join(upload_folder, stored_name)
        file.save(full_path)  # writes the bytes to uploads/<stored_name>

        # Now save the file's INFO to the database via the repo
        return DocumentRepository.create({
            "stored_filename": stored_name,
            "original_filename": secure_filename(file.filename),
            "file_type": file.mimetype,
            "file_size": size,
            "document_type": form_data["document_type"],
            "uploader_id": uploader_id,
            "bid_id": form_data.get("bid_id"),
            "tender_id": form_data.get("tender_id"),
        })

    @staticmethod
    def get(doc_id):
        # Get one document by ID
        return DocumentRepository.get_by_id(doc_id)

    @staticmethod
    def list_mine(uploader_id):
        # Get all documents owned by one user
        return DocumentRepository.list_by_uploader(uploader_id)

    @staticmethod
    def delete(doc, requester_id):
        # SECURITY: only the person who uploaded the file can delete it
        if doc.uploader_id != requester_id:
            raise PermissionError("You can only delete your own documents")

        # Delete the actual file from disk
        full_path = os.path.join(current_app.config["UPLOAD_FOLDER"], doc.stored_filename)
        if os.path.exists(full_path):
            os.remove(full_path)

        # Then delete the row from the database
        DocumentRepository.delete(doc)
