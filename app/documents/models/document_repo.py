# This file is the "Repository". Its only job is to talk to the database.
# It does NOT validate files, check permissions, or talk to users.
# It just saves rows, finds rows, and deletes rows.

from app.extensions import db
from app.documents.models.document import Document


class DocumentRepository:

    @staticmethod
    def create(data):
        # Make a new Document object using the dictionary we got
        doc = Document(**data)
        # Tell the database "remember this new row"
        db.session.add(doc)
        # Save it for real (write to disk)
        db.session.commit()
        return doc

    @staticmethod
    def get_by_id(doc_id):
        # Find one document by its unique ID. Returns None if not found.
        return db.session.get(Document, doc_id)

    @staticmethod
    def list_by_uploader(uploader_id):
        # Find ALL documents uploaded by one user.
        # Sorted newest-first (most recent at the top).
        return Document.query.filter_by(uploader_id=uploader_id).order_by(Document.created_at.desc()).all()

    @staticmethod
    def delete(doc):
        # Remove the row from the database
        db.session.delete(doc)
        db.session.commit()
