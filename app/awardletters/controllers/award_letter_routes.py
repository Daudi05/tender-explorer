import os
import uuid
import traceback
from flask import send_from_directory
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from app.extensions import db
from app.awardletters.models.award_letter import AwardLetter
from app.bids.models.bid import Bid
from app.tenders.models.tender import Tender
from app.auth.models.user import User

award_letter_bp = Blueprint(
    "award_letter_bp",
    __name__,
    url_prefix="/api/award-letters"
)

UPLOAD_FOLDER = os.path.join("uploads", "award_letters")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)



@award_letter_bp.route("/upload/<tender_id>", methods=["POST"])
@jwt_required()
def upload_award_letter(tender_id):

    try:
        user_id = get_jwt_identity()

        # Ensure file exists
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]

        filename = secure_filename(file.filename)
        if not filename:
            return jsonify({"error": "Invalid file name"}), 400

        # Ensure tender exists (prevents silent DB issues)
        tender = db.session.get(Tender, tender_id)
        if not tender:
            return jsonify({"error": "Tender not found"}), 404

        # Find winning bid
        winning_bid = Bid.query.filter_by(
            tender_id=tender_id,
            is_winner=True
        ).first()

        if not winning_bid:
            return jsonify({"error": "No winning bid found"}), 404

        # Create unique filename
        unique_name = f"{uuid.uuid4().hex}_{filename}"
        upload_path = os.path.join(UPLOAD_FOLDER, unique_name)

        # Save file safely
        try:
            file.save(upload_path)
        except Exception as fs_error:
            return jsonify({
                "error": "File save failed",
                "details": str(fs_error)
            }), 500

        file_url = f"/uploads/award_letters/{unique_name}"

        # Create record
        award_letter = AwardLetter(
            tender_id=tender_id,
            employer_id=(user_id),
            contractor_id=(winning_bid.contractor_id),
            file_url=file_url,
        )

        db.session.add(award_letter)
        db.session.commit()

        return jsonify({
            "message": "Award letter uploaded successfully",
            "file_url": file_url
        }), 201

    except Exception as e:
        db.session.rollback()
        print("FULL ERROR TRACE")
        print(traceback.format_exc())
        
        return jsonify({
            "error": "Unexpected server error",
            "details": str(e)
        }), 500


@award_letter_bp.route("/my", methods=["GET"])
@jwt_required()
def get_my_award_letters():

    contractor_id = get_jwt_identity()

    letters = AwardLetter.query.filter_by(
        contractor_id=contractor_id
    ).all()

    results = []

    for letter in letters:

        tender = db.session.get(Tender, letter.tender_id)
        employer = db.session.get(User, letter.employer_id)

        results.append({
            "id": letter.id,
            "tender_title": tender.title if tender else "Tender",
            "employer_name": employer.name if employer else "Employer",
            "file_url": letter.file_url,
            "created_at": letter.created_at.isoformat() if letter.created_at else None,
        })

    return jsonify({"award_letters": results}), 200

@award_letter_bp.route("/file/<filename>")
def serve_award_letter(filename):
    filename = secure_filename(filename)
    return send_from_directory(UPLOAD_FOLDER, filename)