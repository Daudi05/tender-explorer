
"""
Centralized Flask extension instances.
All modules import their dependencies from here so each
extension is initialized exactly once in app/__init__.py.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate

db = SQLAlchemy()
ma = Marshmallow()
bcrypt = Bcrypt()
migrate = Migrate()
