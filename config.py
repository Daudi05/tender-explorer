import os

class Config:
    # Production deployments should override these via environment variables
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production-please")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-key-must-be-32-bytes-or-more-for-hs256")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URI", "sqlite:///tender.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), "uploads")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB
