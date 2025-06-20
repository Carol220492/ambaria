# backend/config.py
import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'una_cadena_secreta_muy_dificil_de_adivinar_y_larga_12345'
    
    # Configuración de la base de datos: usa DATABASE_URL de entorno si existe (para Render/PostgreSQL),
    # de lo contrario, usa SQLite local como fallback para desarrollo.
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
                              'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance', 'site.db')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'super_secreta_clave_jwt_cambiala_en_produccion'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_TOKEN_LOCATION = ['headers']

    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/auth'
    GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
    GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
    GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI') or 'http://localhost:5000/auth/callback'
    SERVER_NAME = os.environ.get('FLASK_SERVER_NAME') or 'localhost:5000'