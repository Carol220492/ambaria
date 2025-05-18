import os

DEBUG = True
UPLOAD_FOLDER = 'uploads'
MAX_CONTENT_LENGTH = 100 * 1024 * 1024
SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_secret_key_here'

# Base de datos SQLite (para desarrollo)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'ambarialocal.db')
SQLALCHEMY_TRACK_MODIFICATIONS = False