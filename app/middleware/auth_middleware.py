# Lightweight wrapper — most routes use flask_jwt_extended's @jwt_required directly.
# This file is here if anyone needs a custom auth layer later.
from flask_jwt_extended import jwt_required as _jwt_required

jwt_required = _jwt_required
