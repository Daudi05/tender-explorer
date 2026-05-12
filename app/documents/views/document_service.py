# ============================================================
# Document SERVICE — the "manager" layer.
# Holds all the BUSINESS RULES:
#   - What file types are allowed?
#   - What's the size limit?
#   - How do we generate a safe unique filename?
#   - Who's allowed to delete what?
# The routes call this; this calls the repository for DB work.
# ============================================================
import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import current_app
from app.documents.models.document_repo import DocumentRepository

# Set lookup is O(1) — way faster than scanning a list on every request.
# Only these extensions are accepted; everything else is rejected.
ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "jpg", "jpeg", "png"}

# 10 MB hard cap. Files bigger than this are rejected before being written.
# Also enforced by Flask globally via MAX_CONTENT_LENGTH in config.py.
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 * 1024 KB * 1024 bytes


class DocumentService:

    # ---------- PRIVATE HELPERS (start with _ by Python convention) ----------

    @staticmethod
    def _get_extension(filename):
        # Get everything after the LAST dot, lowercased.
        # "MyFile.PDF" -> "pdf"
        # rsplit(".", 1) splits ONCE from the right — fastest way.
        return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    @staticmethod
    def _is_allowed(filename):
        # True if the extension is in our whitelist set
        return DocumentService._get_extension(filename) in ALLOWED_EXTENSIONS

    @staticmethod
    def _build_unique_name(original_filename):
        """
        Build a filename that CAN'T collide with any other on disk.
        Format: TIMESTAMP_RANDOMHEX_originalname.ext
        Example: 20260512074210_a1b2c3d4_my_cv.pdf

        - timestamp ensures chronological sorting
        - UUID hex guarantees uniqueness even if two uploads happen the same second
        - secure_filename strips dangerous chars (../, /, etc.) for path safety
        - [:50] caps the base name length so DB doesn't overflow
        """
        ext = DocumentService._get_extension(original_filename)
        safe_base = secure_filename(original_filename.rsplit(".", 1)[0])[:50] or "file"
        ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        return f"{ts}_{uuid.uuid4().hex}_{safe_base}.{ext}"

    # ---------- PUBLIC API (called by the routes) ----------

    @staticmethod
    def upload(file, form_data, uploader_id):
        """
        Validate + save + persist a file. Raises ValueError on rejection.
        Returns the saved Document instance.
        """

        # CHECK 1: did the user actually attach a file?
        if file is None or file.filename == "":
            raise ValueError("No file provided")

        # CHECK 2: is the extension in the whitelist?
        if not DocumentService._is_allowed(file.filename):
            raise ValueError("File type not allowed")

        # CHECK 3: how big is the file?
        # Trick to measure size WITHOUT reading the whole file into memory:
        #   - seek to end of stream
        #   - ask for current position (= total size)
        #   - seek back to start so save() works
        # This is microseconds even for a 100 MB file.
        file.stream.seek(0, os.SEEK_END)
        size = file.stream.tell()
        file.stream.seek(0)
        if size == 0:
            raise ValueError("Empty file")
        if size > MAX_FILE_SIZE:
            raise ValueError("File too large. Max 10 MB")

        # Make sure the uploads/ folder exists (creates if missing)
        upload_folder = current_app.config["UPLOAD_FOLDER"]
        os.makedirs(upload_folder, exist_ok=True)

        # Build the safe unique filename and write the bytes to disk.
        # werkzeug's save() streams in chunks — no full-file memory load.
        stored_name = DocumentService._build_unique_name(file.filename)
        full_path = os.path.join(upload_folder, stored_name)
        file.save(full_path)

        # Now save the file's METADATA to the database via the repository.
        return DocumentRepository.create({
            "stored_filename": stored_name,
            "original_filename": secure_filename(file.filename),
            "file_type": file.mimetype,             # MIME type from the upload
            "file_size": size,
            "document_type": form_data["document_type"],
            "uploader_id": uploader_id,
            "bid_id": form_data.get("bid_id"),      # optional
            "tender_id": form_data.get("tender_id"),# optional
        })

    @staticmethod
    def get(doc_id):
        # Wrapper around the repo's get_by_id — keeps routes from
        # importing the repo directly (clean layering).
        return DocumentRepository.get_by_id(doc_id)

    @staticmethod
    def list_mine(uploader_id):
        return DocumentRepository.list_by_uploader(uploader_id)

    @staticmethod
    def delete(doc, requester_id):
        """
        Delete a document. Only the original uploader is allowed.
        Removes the physical file from disk first, then the DB row.
        """

        # SECURITY: ownership check.
        # Without this, anyone with a valid JWT could delete anyone else's files.
        if doc.uploader_id != requester_id:
            raise PermissionError("You can only delete your own documents")

        # Step 1: remove the actual file from disk (if it exists)
        full_path = os.path.join(
            current_app.config["UPLOAD_FOLDER"],
            doc.stored_filename,
        )
        if os.path.exists(full_path):
            os.remove(full_path)

        # Step 2: remove the database row via the repo
        DocumentRepository.delete(doc)
