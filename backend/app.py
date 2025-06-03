from flask import Flask, jsonify, request, redirect, url_for, session
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv() # Cargar variables de entorno al iniciar la aplicación

# --- INICIO DE LOS CAMBIOS CRUCIALES EN LAS IMPORTACIONES ---

# ELIMINA ESTA LÍNEA (si está presente en tu app.py actual)
# from flask_sqlalchemy import SQLAlchemy

# IMPORTA la instancia de 'db' desde tu nuevo archivo 'extensions.py' usando ABSOLUTA
from backend.extensions import db # <--- ¡CAMBIO IMPORTANTE AQUÍ!

# IMPORTA el nuevo modelo de User usando ABSOLUTA
from backend.models.user import User # <--- ¡CAMBIO IMPORTANTE AQUÍ!

# IMPORTA los blueprints de rutas usando ABSOLUTA
from backend.routes.upload_routes import upload_bp # <--- ¡CAMBIO IMPORTANTE AQUÍ!
from backend.routes.podcast_routes import podcast_bp # <--- ¡CAMBIO IMPORTANTE AQUÍ!

# --- FIN DE LOS CAMBIOS CRUCIALES EN LAS IMPORTACIONES ---


app = Flask(__name__)
app.config.from_pyfile('config.py')

# Inicializamos 'db' con tu aplicación 'app'
db.init_app(app)

# Configuración de Google OAuth 2.0 (obtenidas de la Consola de Google Cloud)
# Ahora leyendo de variables de entorno para mayor seguridad
app.config['GOOGLE_CLIENT_ID'] = os.environ.get('GOOGLE_CLIENT_ID')
app.config['GOOGLE_CLIENT_SECRET'] = os.environ.get('GOOGLE_CLIENT_SECRET')
app.config['GOOGLE_AUTHORIZE_URL'] = 'https://accounts.google.com/o/oauth2/auth'
app.config['GOOGLE_TOKEN_URL'] = 'https://oauth2.googleapis.com/token'
app.config['GOOGLE_USERINFO_URL'] = 'https://www.googleapis.com/oauth2/v1/userinfo'
app.config['GOOGLE_SCOPES'] = ['openid', 'email', 'profile']

app.register_blueprint(upload_bp, url_prefix='/')
app.register_blueprint(podcast_bp, url_prefix='/podcasts')

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

# --- Mantener tus rutas existentes ---
@app.route('/')
def hello():
    try:
        resultado = 10 / 0
        return "Resultado: {}".format(resultado)
    except ZeroDivisionError:
        return jsonify({"error": "¡Error! División por cero.", "code": 400}), 400

@app.route('/podcasts', methods=['POST'])
def create_podcast():
    try:
        data = request.get_json()
        if not data or 'title' not in data or 'description' not in data:
            return jsonify({"error": "Faltan datos requeridos.", "code": 400}), 400

        db.session.commit()
        return jsonify({"message": "Podcast creado con éxito (simulado).", "code": 201}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e), "code": 500}), 500


if __name__ == '__main__':
    if not app.config['GOOGLE_CLIENT_ID'] or not app.config['GOOGLE_CLIENT_SECRET']:
        print("ADVERTENCIA: Las variables de entorno GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET no están configuradas.")
        print("La autenticación de Google no funcionará correctamente. Crea un archivo .env o configúralas manualmente.")