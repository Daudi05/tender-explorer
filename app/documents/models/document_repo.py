# ============================================================
# Document REPOSITORY — talks ONLY to the database.
# No business logic, no HTTP, no file I/O — pure CRUD.
# The service layer calls this; this layer calls SQLAlchemy.
# ============================================================
from app.extensions import db
from app.documents.models.document import Document


class DocumentRepository:

    @staticmethod
    def create(data):
        # Build a Document object from the dict the service passed in
        doc = Document(**data)  # ** unpacks the dict into keyword args
        db.session.add(doc)     # tell SQLAlchemy "track this new row"
        db.session.commit()     # actually write it to disk (INSERT INTO documents...)
        return doc

    @staticmethod
    def get_by_id(doc_id):
        # SQLAlchemy 2.x style — fastest possible PK lookup.
        # Returns None if not found (doesn't raise).
        return db.session.get(Document, doc_id)

    @staticmethod
    def list_by_uploader(uploader_id):
        # Build a query: WHERE uploader_id = ? ORDER BY created_at DESC
        # The index on uploader_id makes this sub-millisecond.
        return (Document.query
                .filter_by(uploader_id=uploader_id)
                .order_by(Document.created_at.desc())  # newest first
                .all())

    @staticmethod
    def delete(doc):
        # SQLAlchemy translates this to: DELETE FROM documents WHERE id = ?
        db.session.delete(doc)
        db.session.commit()
