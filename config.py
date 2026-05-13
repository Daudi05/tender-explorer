import os

class Config:
    SECRET_KEY = "dev-secret"
    JWT_SECRET_KEY = "dev-jwt-secret"
    SQLALCHEMY_DATABASE_URI = "sqlite:///tender.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), "uploads")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024