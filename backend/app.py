# backend/app.py

from flask import Flask, jsonify, request, redirect, url_for, session
import os
import requests
import json
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import urllib.parse # <-- NUEVA IMPORTACIÓN!
from config import Config # CORRECTO: Importación directa de config

load_dotenv() # Cargar variables de entorno al iniciar la aplicación

from extensions import db # <-- ¡CORREGIDO! Quitado 'backend.'
from models.user import User # <-- ¡CORREGIDO! Quitado 'backend.'
# from models.podcast import Podcast # Puedes quitar esto si no lo usas directamente aquí
from models.comment import Comment # <-- ¡CORREGIDO! Quitado 'backend.'

from routes.upload_routes import upload_bp # <-- ¡CORREGIDO! Quitado 'backend.'
from routes.podcast_routes import podcast_bp # <-- ¡CORREGIDO! Quitado 'backend.'
from routes.comment_routes import comment_bp # <-- ¡CORREGIDO! Quitado 'backend.'

app = Flask(__name__)
app.config.from_object(Config) # Cambiado de from_pyfile a from_object
print(f"DEBUG APP: SQLALCHEMY_DATABASE_URI cargado: {app.config.get('SQLALCHEMY_DATABASE_URI')}") # Mantenemos el debug print

instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
if not os.path.exists(instance_path):
    os.makedirs(instance_path)
    print(f"DEBUG APP: Creada carpeta de instancia: {instance_path}")

app.secret_key = app.config['SECRET_KEY']

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

db.init_app(app)
migrate = Migrate(app, db)

jwt = JWTManager(app)

# ==========================================================
# CÓDIGO PARA INICIALIZAR LA BASE DE DATOS EN RENDER (PostgreSQL)
# Esto creará las tablas si no existen. Es seguro ejecutarlo.
# ==========================================================
with app.app_context():
    db.create_all()
    print("DEBUG APP: Database tables checked/created.")
# ==========================================================


# Configuración de Google OAuth 2.0 (obtenidas de la Consola de Google Cloud)
app.config['GOOGLE_CLIENT_ID'] = os.environ.get('GOOGLE_CLIENT_ID')
app.config['GOOGLE_CLIENT_SECRET'] = os.environ.get('GOOGLE_CLIENT_SECRET')
app.config['GOOGLE_AUTHORIZE_URL'] = 'https://accounts.google.com/o/oauth2/auth'
app.config['GOOGLE_TOKEN_URL'] = 'https://oauth2.googleapis.com/token'
app.config['GOOGLE_USERINFO_URL'] = 'https://www.googleapis.com/oauth2/v1/userinfo'
app.config['GOOGLE_REDIRECT_URI'] = os.environ.get('GOOGLE_REDIRECT_URI') or 'http://localhost:5000/auth/google/callback'
# IMPORTANTE: En Render, esta URL deberá coincidir con la Public URL de tu backend + /auth/google/callback
# Ejemplo: https://ambaria-backend-xxxx.onrender.com/auth/google/callback

# Registrar Blueprints
app.register_blueprint(upload_bp)
app.register_blueprint(podcast_bp)
app.register_blueprint(comment_bp)

# --- Rutas de Autenticación con Google OAuth ---
@app.route('/auth/google')
def google_oauth_login():
    """Redirige al usuario a la página de inicio de sesión de Google."""
    print("DEBUG BACKEND: Iniciando flujo de autenticación de Google.")
    params = {
        'response_type': 'code',
        'client_id': app.config['GOOGLE_CLIENT_ID'],
        'redirect_uri': app.config['GOOGLE_REDIRECT_URI'],
        'scope': 'openid email profile',
        'access_type': 'offline',
        'prompt': 'consent' # Opcional: 'select_account' o 'consent' si quieres forzar la selección de cuenta o el consentimiento
    }
    return redirect(f"{app.config['GOOGLE_AUTHORIZE_URL']}?{urllib.parse.urlencode(params)}")

@app.route('/auth/google/callback')
def google_oauth_callback():
    """Maneja la devolución de llamada de Google OAuth."""
    code = request.args.get('code')
    if not code:
        print("DEBUG BACKEND: No se recibió código de autorización de Google.")
        return jsonify({"error": "No se recibió el código de autorización."}), 400

    # Intercambiar código por token de acceso
    token_params = {
        'code': code,
        'client_id': app.config['GOOGLE_CLIENT_ID'],
        'client_secret': app.config['GOOGLE_CLIENT_SECRET'],
        'redirect_uri': app.config['GOOGLE_REDIRECT_URI'],
        'grant_type': 'authorization_code'
    }
    token_response = requests.post(app.config['GOOGLE_TOKEN_URL'], data=token_params)
    token_data = token_response.json()

    if 'access_token' not in token_data:
        print(f"DEBUG BACKEND: Error al obtener token de acceso: {token_data.get('error_description', token_data)}")
        return jsonify({"error": "Error al obtener el token de acceso de Google."}), 400

    access_token = token_data['access_token']

    # Obtener información del usuario
    userinfo_response = requests.get(app.config['GOOGLE_USERINFO_URL'], headers={'Authorization': f'Bearer {access_token}'})
    user_info = userinfo_response.json()

    if user_info:
        user = User.query.filter_by(google_id=user_info['id']).first()
        if not user:
            # Crear un nuevo usuario si no se encuentra
            user = User(
                google_id=user_info['id'],
                email=user_info['email'],
                name=user_info.get('name'),
                profile_picture=user_info.get('picture')
            )
            db.session.add(user)
            db.session.commit()
            print(f"DEBUG BACKEND: Nuevo usuario creado: {user.email}")
        else:
            print(f"DEBUG BACKEND: Usuario existente encontrado: {user.email}")
            # Opcionalmente, actualizar la información del usuario si cambia (ej. foto de perfil)
            user.name = user_info.get('name')
            user.profile_picture = user_info.get('picture')
            db.session.commit()

        # Generar token JWT
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "email": user.email,
                "profile_picture": user.profile_picture
            }
        )

        frontend_redirect_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000') + '/auth-callback'
        print(f"DEBUG BACKEND: Redirigiendo a frontend: {frontend_redirect_url}?token={access_token}")
        return redirect(f"{frontend_redirect_url}?token={access_token}")
    else:
        print("DEBUG BACKEND: No se pudo obtener la información del usuario de Google.")
        return jsonify({"error": "No se pudo obtener la información del usuario de Google."}), 400

@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    print(f"DEBUG BACKEND: Intentando obtener perfil para user_id: {current_user_id}")

    try:
        user_id_int = int(current_user_id)
    except ValueError:
        return jsonify({"message": "ID de usuario inválido en el token."}), 400

    user = User.query.get(user_id_int)

    if user:
        print(f"DEBUG BACKEND: Usuario encontrado: {user.name}")
        return jsonify({
            "message": f"¡Bienvenido, {user.name}!",
            "user_id": user.id,
            "email": user.email,
            "profile_picture": user.profile_picture
        })
    else:
        print(f"DEBUG BACKEND: Usuario con ID {current_user_id} no encontrado en la base de datos.")
        return jsonify({"message": "Usuario no encontrado."}), 404

@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    session.pop('user_id', None)
    session.pop('google_id', None)
    session.pop('email', None)

    return jsonify({"message": "Sesión cerrada con éxito."})

# --- Mantener tus rutas existentes (solo para claridad, ya están registradas como Blueprints): ---
@app.route('/')
def hello():
    return jsonify({"message": "Bienvenido a la API de Ambaria."}), 200

if __name__ == '__main__':
    if not app.config['GOOGLE_CLIENT_ID'] or not app.config['GOOGLE_CLIENT_SECRET']:
        print("ADVERTENCIA: Las variables de entorno GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET no están configuradas.")
        print("La autenticación de Google no funcionará correctamente. Crea un archivo .env o configúralas manualmente.")
    if not app.config['JWT_SECRET_KEY']:
        print("ADVERTENCIA: La variable de entorno JWT_SECRET_KEY no está configurada.")
        print("Los tokens JWT no se firmarán correctamente. Crea un archivo .env o configúrala manualmente.")

    app.run(debug=True, port=5000)