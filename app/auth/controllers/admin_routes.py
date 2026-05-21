from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.middleware.role_middleware import role_required

from app.auth.models.user import User
from app.bids.models.bid import Bid
from app.tenders.models.tender import Tender


admin_bp = Blueprint(
    "admin",
    __name__,
    url_prefix="/api/admin"
)


# =========================================
# ADMIN DASHBOARD
# =========================================
@admin_bp.route("/dashboard", methods=["GET"])
@jwt_required()
@role_required("ADMIN")
def admin_dashboard():

    # =====================================
    # STATS
    # =====================================

    flagged_bids = Bid.query.filter_by(
        is_flagged=True
    ).count()

    pending_documents = User.query.filter_by(
        is_verified=False
    ).count()

    registered_users = User.query.count()

    active_tenders = Tender.query.filter_by(
        status="OPEN"
    ).count()

    # =====================================
    # RECENT FRAUD ALERTS
    # =====================================

    flagged = (
        Bid.query
        .filter(Bid.is_flagged == True)
        .order_by(Bid.created_at.desc())
        .limit(10)
        .all()
    )

    fraud_alerts = []

    for bid in flagged:

        fraud_alerts.append({

            "contractor": (
                bid.contractor.name
                if bid.contractor else "Unknown"
            ),

            "tender": (
                bid.tender.title
                if bid.tender else "Unknown"
            ),

            "fraud_score": bid.fraud_score,

            "status": bid.status
        })

    return jsonify({

        "stats": {

            "flagged_bids": flagged_bids,

            "pending_documents": pending_documents,

            "registered_users": registered_users,

            "active_tenders": active_tenders
        },

        "fraud_alerts": fraud_alerts

    }), 200