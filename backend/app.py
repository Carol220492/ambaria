from flask import Flask, jsonify, request, redirect, url_for, session
import os
import requests
import json
from dotenv import load_dotenv
from flask_migrate import Migrate # <--- AÑADE ESTA LÍNEA


load_dotenv() # Cargar variables de entorno al iniciar la aplicación

from backend.extensions import db
from backend.models.user import User

from backend.routes.upload_routes import upload_bp
from backend.routes.podcast_routes import podcast_bp

app = Flask(__name__)
app.config.from_pyfile('config.py')

db.init_app(app)
migrate = Migrate(app, db) # <--- NUEVA LÍNEA

# Configuración de Google OAuth 2.0 (obtenidas de la Consola de Google Cloud)
app.config['GOOGLE_CLIENT_ID'] = os.environ.get('GOOGLE_CLIENT_ID')
app.config['GOOGLE_CLIENT_SECRET'] = os.environ.get('GOOGLE_CLIENT_SECRET')
app.config['GOOGLE_AUTHORIZE_URL'] = 'https://accounts.google.com/o/oauth2/auth'
app.config['GOOGLE_TOKEN_URL'] = 'https://oauth2.googleapis.com/token'
app.config['GOOGLE_USERINFO_URL'] = 'https://www.googleapis.com/oauth2/v1/userinfo'
app.config['GOOGLE_SCOPES'] = ['openid', 'email', 'profile']

# Registrar Blueprints
app.register_blueprint(upload_bp, url_prefix='/') # Si upload_bp maneja la raíz o es un blueprint general
app.register_blueprint(podcast_bp, url_prefix='/podcasts') # El Blueprint de podcasts con su prefijo

# --- Rutas de Autenticación de Google ---

@app.route('/login')
def login():
    redirect_uri = url_for('callback', _external=True)
    params = {
        'response_type': 'code',
        'client_id': app.config['GOOGLE_CLIENT_ID'],
        'redirect_uri': redirect_uri,
        'scope': ' '.join(app.config['GOOGLE_SCOPES']),
        'access_type': 'offline',
        'prompt': 'consent'
    }
    auth_url = app.config['GOOGLE_AUTHORIZE_URL'] + '?' + requests.compat.urlencode(params)
    return redirect(auth_url)

@app.route('/callback')
def callback():
    if 'error' in request.args:
        return jsonify({"error": "Error de autenticación de Google: " + request.args['error']}), 400
    if 'code' not in request.args:
        return jsonify({"error": "No se proporcionó el código de autorización."}), 400

    code = request.args.get('code')
    redirect_uri = url_for('callback', _external=True)

    token_data = {
        'code': code,
        'client_id': app.config['GOOGLE_CLIENT_ID'],
        'client_secret': app.config['GOOGLE_CLIENT_SECRET'],
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
    }
    try:
        response = requests.post(app.config['GOOGLE_TOKEN_URL'], data=token_data)
        response.raise_for_status()
        tokens = response.json()
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error al obtener tokens de Google: {e}"}), 500

    access_token = tokens.get('access_token')
    if not access_token:
        return jsonify({"error": "No se recibió el token de acceso de Google."}), 500

    headers = {'Authorization': f'Bearer {access_token}'}
    try:
        userinfo_response = requests.get(app.config['GOOGLE_USERINFO_URL'], headers=headers)
        userinfo_response.raise_for_status()
        user_info = userinfo_response.json()
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error al obtener información del usuario de Google: {e}"}), 500

    google_id = user_info.get('id')
    email = user_info.get('email')
    name = user_info.get('name')
    profile_picture = user_info.get('picture')

    if not google_id or not email:
        return jsonify({"error": "Información de usuario incompleta de Google."}), 500

    user = User.query.filter_by(google_id=google_id).first()
    if not user:
        user = User(google_id=google_id, email=email, name=name, profile_picture=profile_picture)
        db.session.add(user)
    else:
        user.email = email
        user.name = name
        user.profile_picture = profile_picture
    
    db.session.commit()

    session['user_id'] = user.id
    session['google_id'] = user.google_id
    session['email'] = user.email

    return redirect(url_for('profile'))

@app.route('/profile')
def profile():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({
                "message": f"¡Bienvenido, {user.name}!",
                "user_id": user.id,
                "email": user.email,
                "profile_picture": user.profile_picture
            })
    return jsonify({"message": "No estás autenticado."}), 401

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('google_id', None)
    session.pop('email', None)
    return jsonify({"message": "Sesión cerrada con éxito."})

# --- Mantener tus rutas existentes (¡NO ELIMINAR ESTA!): ---
@app.route('/')
def hello():
    # Asegúrate de haber eliminado la línea "resultado = 10 / 0" si no la necesitas.
    return jsonify({"message": "Bienvenido a la API de Ambaria."}), 200

# # --- LA RUTA DUPLICADA DE '/podcasts' HA SIDO ELIMINADA DE AQUÍ. ---
# # LA GESTIÓN DE PODCASTS AHORA SE HACE COMPLETAMENTE DESDE podcast_routes.py.

if __name__ == '__main__':
    if not app.config['GOOGLE_CLIENT_ID'] or not app.config['GOOGLE_CLIENT_SECRET']:
        print("ADVERTENCIA: Las variables de entorno GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET no están configuradas.")
        print("La autenticación de Google no funcionará correctamente. Crea un archivo .env o configúralas manualmente.")