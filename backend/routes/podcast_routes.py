# backend/routes/podcast_routes.py

from flask import Blueprint, jsonify, request, current_app, send_from_directory, url_for
from werkzeug.utils import secure_filename
import os

from backend.models.podcast import Podcast
from backend.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity # IMPORTAR JWT

from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import SQLAlchemyError

podcast_bp = Blueprint('podcasts', __name__, url_prefix='/podcasts')

# Define los tipos de archivos permitidos
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'aac', 'flac'}
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

@podcast_bp.route('/', methods=['POST'], strict_slashes=False) # Añadir strict_slashes=False
@jwt_required() # Asegurar que esta ruta requiere un token JWT
def create_podcast():
    # Asegúrate de que el usuario esté autenticado usando JWT
    current_user_id = get_jwt_identity() # Obtener el ID del usuario del token JWT
    if not current_user_id:
        return jsonify({"error": "No autenticado. Inicia sesión para crear un podcast.", "code": 401}), 401

    user_id = current_user_id # Usar el user_id del token JWT

    # Si no se envía ningún archivo en la solicitud
    if 'audio_file' not in request.files:
        return jsonify({"error": "No se proporcionó ningún archivo de audio.", "code": 400}), 400

    audio_file = request.files['audio_file']
    cover_image_file = request.files.get('cover_image')

    # Validar si se seleccionó un archivo y tiene un nombre
    if audio_file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo de audio.", "code": 400}), 400

    if not allowed_file(audio_file.filename, ALLOWED_EXTENSIONS):
        return jsonify({"error": "Tipo de archivo de audio no permitido.", "code": 400}), 400

    # Procesar la imagen de portada si se proporciona
    cover_image_filename = None
    if cover_image_file and cover_image_file.filename != '':
        if not allowed_file(cover_image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({"error": "Tipo de archivo de imagen no permitido.", "code": 400}), 400
        cover_image_filename = secure_filename(cover_image_file.filename)
        cover_image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], cover_image_filename)
        cover_image_file.save(cover_image_path)

    # Guardar el archivo de audio
    audio_filename = secure_filename(audio_file.filename)
    audio_path = os.path.join(current_app.config['UPLOAD_FOLDER'], audio_filename)
    audio_file.save(audio_path)

    # Obtener metadatos del podcast
    title = request.form.get('title')
    artist = request.form.get('artist') # Nuevo campo
    genre = request.form.get('genre')   # Nuevo campo
    description = request.form.get('description', '') # Descripción es opcional

    if not title or not artist or not genre:
        return jsonify({"error": "Título, artista y género son campos obligatorios.", "code": 400}), 400

    try:
        new_podcast = Podcast(
            title=title,
            artist=artist,  # Asignar el nuevo campo
            genre=genre,    # Asignar el nuevo campo
            description=description,
            audio_path=audio_path,
            cover_image_path=cover_image_path,
            user_id=user_id # Asignar el ID del usuario actual
        )
        db.session.add(new_podcast)
        db.session.commit()
        return jsonify({"message": "Podcast creado con éxito", "podcast_id": new_podcast.id, "audio_url": f"/podcasts/uploads/{audio_filename}"}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        # Eliminar archivos si la inserción en la DB falla
        if os.path.exists(audio_path):
            os.remove(audio_path)
        if cover_image_path and os.path.exists(cover_image_path):
            os.remove(cover_image_path)
        return jsonify({"error": "Error al guardar el podcast en la base de datos: " + str(e), "code": 500}), 500


@podcast_bp.route('/', methods=['GET'], strict_slashes=False) # Añadir strict_slashes=False
@jwt_required() # Asegurar que esta ruta requiere un token JWT
def get_all_podcasts():
    try:
        # Aquí puedes obtener el user_id si quieres mostrar podcasts específicos del usuario
        # current_user_id = get_jwt_identity()

        podcasts = Podcast.query.all()
        podcast_list = []
        for podcast in podcasts:
            # Asegúrate de que las rutas sean accesibles desde el frontend
            audio_url = url_for('podcasts.uploaded_file', filename=os.path.basename(podcast.audio_path), _external=True)
            cover_image_url = None
            if podcast.cover_image_path:
                cover_image_url = url_for('podcasts.uploaded_file', filename=os.path.basename(podcast.cover_image_path), _external=True)

            podcast_list.append({
                'id': podcast.id,
                'title': podcast.title,
                'artist': podcast.artist, # Incluir el nuevo campo
                'genre': podcast.genre,   # Incluir el nuevo campo
                'description': podcast.description,
                'audio_url': audio_url,
                'cover_image_url': cover_image_url,
                'created_at': podcast.created_at.isoformat(),
                'user_id': podcast.user_id
            })
        return jsonify(podcasts=podcast_list), 200
    except SQLAlchemyError as e:
        return jsonify({"error": "Error al obtener la lista de podcasts: " + str(e), "code": 500}), 500

@podcast_bp.route('/<int:podcast_id>', methods=['GET'])
@jwt_required() # Asegurar que esta ruta requiere un token JWT
def get_podcast(podcast_id):
    try:
        podcast = Podcast.query.get_or_404(podcast_id)
        audio_url = url_for('podcasts.uploaded_file', filename=os.path.basename(podcast.audio_path), _external=True)
        cover_image_url = None
        if podcast.cover_image_path:
            cover_image_url = url_for('podcasts.uploaded_file', filename=os.path.basename(podcast.cover_image_path), _external=True)

        return jsonify({
            'id': podcast.id,
            'title': podcast.title,
            'artist': podcast.artist, # Incluir el nuevo campo
            'genre': podcast.genre,   # Incluir el nuevo campo
            'description': podcast.description,
            'audio_url': audio_url,
            'cover_image_url': cover_image_url,
            'created_at': podcast.created_at.isoformat(),
            'user_id': podcast.user_id
        }), 200
    except NoResultFound:
        return jsonify({"error": "Podcast no encontrado", "code": 404}), 404
    except SQLAlchemyError as e:
        return jsonify({"error": "Error al obtener el podcast: " + str(e), "code": 500}), 500

@podcast_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    # Asegúrate de que esta ruta no requiere autenticación si las imágenes/audios deben ser públicos
    # Si quieres restringir el acceso, puedes añadir @jwt_required() aquí.
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)