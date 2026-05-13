"""
Centralized Flask extension instances.
All modules import their dependencies from here so each
extension is initialized exactly once in app/__init__.py.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt

# Optional: flask-migrate is used by teammates for DB migrations
try:
    from flask_migrate import Migrate
    migrate = Migrate()
except ImportError:
    migrate = None

db = SQLAlchemy()
jwt = JWTManager()
ma = Marshmallow()
bcrypt = Bcrypt()
