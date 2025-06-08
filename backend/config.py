# backend/config.py

import os

DEBUG = True
UPLOAD_FOLDER = 'uploads'
MAX_CONTENT_LENGTH = 100 * 1024 * 1024
SECRET_KEY = os.environ.get('SECRET_KEY') or 'tu_clave_secreta_aqui_para_sesion' # Puedes mantenerla por si Flask la necesita para otras cosas

# Base de datos SQLite (para desarrollo)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'ambarialocal.db')
SQLALCHEMY_TRACK_MODIFICATIONS = False

# --- ¡NUEVAS LÍNEAS PARA JWT! ---
JWT_SECRET_KEY = 'e8643662cab400ee1b76296f75bb1bcef1c6300eb7ef23e8b3c17c9267101a57' # <-- ¡Cambia esta cadena!
JWT_TOKEN_LOCATION = ['headers', 'cookies', 'query_string'] # Le dice a Flask-JWT-Extended dónde buscar el token
