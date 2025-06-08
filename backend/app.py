# backend/app.py

from flask import Flask, jsonify, request, redirect, url_for, session
import os
import requests
import json
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity # <--- ¡IMPORTACIONES CLAVE!
from flask_jwt_extended.utils import decode_token # <--- ¡NUEVA IMPORTACIÓN PARA DEPURACIÓN MANUAL!

load_dotenv() # Cargar variables de entorno al iniciar la aplicación

from backend.extensions import db
from backend.models.user import User

from backend.routes.upload_routes import upload_bp
from backend.routes.podcast_routes import podcast_bp

app = Flask(__name__)
app.config.from_pyfile('config.py')

app.secret_key = app.config['SECRET_KEY'] # Asegura que SECRET_KEY se cargue temprano para la sesión

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

db.init_app(app)
migrate = Migrate(app, db)

# --- ¡INICIALIZAR JWTManager DESPUÉS DE app = Flask(__name__) Y app.config.from_pyfile! ---
# FORZANDO LA JWT_SECRET_KEY DIRECTAMENTE AQUÍ PARA DEPURAR (VALOR REAL DE TU .env)
app.config["JWT_SECRET_KEY"] = "e8643662cab400ee1b76296f75bb1bcef1c6300eb7ef23e8b3c17c9267101a57" # <--- ¡CAMBIA ESTO CON TU CLAVE REAL!

jwt = JWTManager(app)

# --- ¡NUEVAS LÍNEAS CLAVE PARA DESACTIVAR CSRF Y ESPECIFICAR UBICACIÓN! ---
app.config["JWT_CSRF_ENABLED"] = False # Desactivar la protección CSRF (temporalmente para depurar)
app.config["JWT_TOKEN_LOCATION"] = ['headers'] # Decir a Flask-JWT-Extended que solo busque el token en las cabeceras

# --- ¡NUEVOS DEBUG PARA VERIFICAR LAS CONFIGURACIONES AL INICIAR EL SERVIDOR! ---
print(f"DEBUG BACKEND: JWT_SECRET_KEY utilizada por Flask: {app.config.get('JWT_SECRET_KEY')}")
print(f"DEBUG BACKEND: JWT_CSRF_ENABLED: {app.config.get('JWT_CSRF_ENABLED')}")
print(f"DEBUG BACKEND: JWT_TOKEN_LOCATION: {app.config.get('JWT_TOKEN_LOCATION')}")
if app.config.get('JWT_SECRET_KEY') is None:
    print("DEBUG BACKEND: ¡ADVERTENCIA! JWT_SECRET_KEY no está configurada en app.config. Verifique config.py y .env")


# Configuración de Google OAuth 2.0 (obtenidas de la Consola de Google Cloud)
app.config['GOOGLE_CLIENT_ID'] = os.environ.get('GOOGLE_CLIENT_ID')
app.config['GOOGLE_CLIENT_SECRET'] = os.environ.get('GOOGLE_CLIENT_SECRET')
app.config['GOOGLE_AUTHORIZE_URL'] = 'https://accounts.google.com/o/oauth2/auth'
app.config['GOOGLE_TOKEN_URL'] = 'https://oauth2.googleapis.com/token'
app.config['GOOGLE_USERINFO_URL'] = 'https://www.googleapis.com/oauth2/v1/userinfo'
app.config['GOOGLE_SCOPES'] = ['openid', 'email', 'profile']

# Registrar Blueprints
app.register_blueprint(upload_bp, url_prefix='/')
app.register_blueprint(podcast_bp, url_prefix='/podcasts')

@app.route('/login')
def login():
    google_authorize_url = app.config['GOOGLE_AUTHORIZE_URL']
    client_id = app.config['GOOGLE_CLIENT_ID']
    redirect_uri = url_for('callback', _external=True)
    scope = ' '.join(app.config['GOOGLE_SCOPES'])

    auth_url = (
        f"{google_authorize_url}?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"scope={scope}&"
        f"response_type=code"
    )
    return redirect(auth_url)

@app.route('/callback')
def callback():
    code = request.args.get('code')
    if not code:
        return jsonify({"message": "Falta el código de autorización de Google."}), 400

    token_url = app.config['GOOGLE_TOKEN_URL']
    client_id = app.config['GOOGLE_CLIENT_ID']
    client_secret = app.config['GOOGLE_CLIENT_SECRET']
    redirect_uri = url_for('callback', _external=True)

    token_payload = {
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
    }

    try:
        token_response = requests.post(token_url, data=token_payload)
        token_response.raise_for_status() # Lanza una excepción para errores HTTP (4xx o 5xx)
        tokens = token_response.json()
        access_token = tokens['access_token']

        userinfo_url = app.config['GOOGLE_USERINFO_URL']
        headers = {'Authorization': f'Bearer {access_token}'}
        userinfo_response = requests.get(userinfo_url, headers=headers)
        userinfo_response.raise_for_status()
        user_info = userinfo_response.json()

        email = user_info.get('email')
        name = user_info.get('name')
        profile_picture = user_info.get('picture')
        google_id = user_info.get('id') # Asegúrate de obtener el ID de Google

        user = User.query.filter_by(google_id=google_id).first()

        if user is None:
            user = User(google_id=google_id, email=email, name=name, profile_picture=profile_picture)
            db.session.add(user)
            db.session.commit()
            print(f"DEBUG BACKEND: Nuevo usuario creado: {user.email}")
        else:
            # Opcional: actualizar datos del usuario si cambian en Google
            user.email = email
            user.name = name
            user.profile_picture = profile_picture
            db.session.commit()
            print(f"DEBUG BACKEND: Usuario existente actualizado: {user.email}")

        # Crear el token JWT para el usuario
        jwt_token = create_access_token(identity=str(user.id)) # <--- ¡CAMBIO CLAVE AQUÍ!
        print(f"DEBUG BACKEND: Token JWT generado en callback: {jwt_token}")
        
        # Redirigir al frontend con el token JWT
        print(f"DEBUG BACKEND: Redirigiendo a: http://localhost:3000/profile?token={jwt_token}")
        return redirect(f'http://localhost:3000/profile?token={jwt_token}')

    except requests.exceptions.RequestException as e:
        print(f"Error en la solicitud HTTP de Google OAuth: {e}")
        return jsonify({"message": f"Error al procesar la autenticación con Google: {e}"}), 500
    except json.JSONDecodeError as e:
        print(f"Error al decodificar JSON de Google OAuth: {e}")
        return jsonify({"message": "Error al decodificar la respuesta de Google."}), 500
    except Exception as e:
        print(f"Error inesperado en el callback de Google: {e}")
        return jsonify({"message": f"Error inesperado en el callback: {e}"}), 500

@app.route('/profile')
# @jwt_required() # <--- ¡COMENTA O ELIMINA ESTA LÍNEA TEMPORALMENTE!
def profile():
    print("DEBUG BACKEND: Entrando a la ruta /profile (decorador jwt_required() omitido para depuración manual).")
    
    try:
        # 1. Obtener el token de la cabecera Authorization
        auth_header = request.headers.get('Authorization')
        print(f"DEBUG BACKEND: Cabecera Authorization recibida: {auth_header}")

        if not auth_header or not auth_header.startswith('Bearer '):
            print("DEBUG BACKEND: ERROR: Cabecera Authorization no encontrada o no tiene formato 'Bearer '.")
            return jsonify({"message": "Token de autorización faltante o mal formado."}), 401
        
        token = auth_header.split(" ")[1]
        print(f"DEBUG BACKEND: Token extraído: {token}")

        # 2. Intentar verificar/decodificar el token manualmente
        #    Usaremos una función interna de Flask-JWT-Extended que jwt_required() usa.
        #    Esto puede lanzar una excepción si el token es inválido o expirado.
        
        try:
            decoded_token = decode_token(token) # decode_token ya está importado arriba
            print(f"DEBUG BACKEND: Token decodificado exitosamente: {decoded_token}")
            
            # Obtener la identidad del token
            current_user_id = decoded_token.get('sub') # 'sub' es la clave por defecto para la identidad (subject)
            print(f"DEBUG BACKEND: ID de usuario obtenido del JWT decodificado: {current_user_id}")

        except Exception as e:
            print(f"DEBUG BACKEND: ERROR AL DECODIFICAR/VERIFICAR EL TOKEN: {e}")
            # Aquí capturaremos el error exacto de Flask-JWT-Extended
            return jsonify({"message": f"Token JWT inválido o expirado: {e}"}), 401

        # Si la decodificación fue exitosa, procedemos con el resto de la lógica
        user = User.query.get(current_user_id)
        if user:
            print(f"DEBUG BACKEND: Usuario encontrado: {user.name}")
            return jsonify({
                "message": f"¡Bienvenido, {user.name}!",
                "user_id": user.id,
                "email": user.email,
                "profile_picture": user.profile_picture
            })
        print("DEBUG BACKEND: ERROR: Usuario no encontrado a pesar de token decodificado válidamente.")
        return jsonify({"message": "Usuario no encontrado a pesar de token válido."}), 401
        
    except Exception as e:
        # Esto atrapará cualquier otro error inesperado en este bloque
        print(f"DEBUG BACKEND: ERROR GENERAL EN /profile: {e}")
        return jsonify({"message": f"Error interno inesperado: {e}"}), 500

@app.route('/logout', methods=['POST']) # Logout debe ser POST por seguridad
@jwt_required() # Opcional: asegurar que solo usuarios loggeados puedan hacer logout de forma segura
def logout():
    # Con JWT, el logout es principalmente "eliminar el token del lado del cliente".
    # Puedes limpiar la sesión de Flask por si acaso, aunque ya no es la principal para auth.
    session.pop('user_id', None)
    session.pop('google_id', None)
    session.pop('email', None)
    
    # Si usas listas negras para JWT, aquí revocarías el token
    # (No implementado en este ejemplo, pero es una opción para seguridad avanzada)
    
    return jsonify({"message": "Sesión cerrada con éxito."})

# --- Mantener tus rutas existentes (¡NO ELIMINAR ESTA!): ---
@app.route('/')
def hello():
    return jsonify({"message": "Bienvenido a la API de Ambaria."}), 200

if __name__ == '__main__':
    if not app.config['GOOGLE_CLIENT_ID'] or not app.config['GOOGLE_CLIENT_SECRET']:
        print("ADVERTENCIA: Las variables de entorno GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET no están configuradas.")
        print("La autenticación de Google no funcionará correctamente. Crea un archivo .env o configúralas manualmente.")
    # Asegúrate de que JWT_SECRET_KEY también esté configurada
    if not app.config['JWT_SECRET_KEY']:
        print("ADVERTENCIA: JWT_SECRET_KEY no está configurada. La autenticación JWT no funcionará correctamente.")
    
    # Si quieres ejecutar la app directamente sin `flask run`, descomenta esto.
    # No lo uses con `flask run` porque duplicaría el servidor.
    # app.run(debug=True)