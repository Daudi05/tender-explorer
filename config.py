import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:password@localhost/tender_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'super-secret-key'
    UPLOAD_FOLDER = 'app/static/uploads'
