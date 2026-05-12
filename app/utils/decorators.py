# Re-export the shared decorators so everyone can do:
#   from app.utils.decorators import role_required, verified_required
from app.middleware.role_middleware import role_required, verified_required

__all__ = ["role_required", "verified_required"]
