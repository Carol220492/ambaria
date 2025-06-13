from flask import Blueprint, jsonify, request, session, current_app, send_from_directory, url_for
from werkzeug.utils import secure_filename
import os

from backend.models.podcast import Podcast
from backend.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import SQLAlchemyError

# CAMBIO 1: Eliminar url_prefix de la definición de la Blueprint
# Ahora las rutas dentro de la blueprint incluirán el prefijo '/podcasts' explícitamente.
podcast_bp = Blueprint('podcasts', __name__)

ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'aac', 'flac'}
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

# CAMBIO 2: Añadir '/podcasts' a la ruta POST
@podcast_bp.route('/podcasts', methods=['POST'], strict_slashes=False) # Añadido /podcasts y strict_slashes=False
@jwt_required()
def create_podcast():
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return jsonify({"error": "No autenticado. Inicia sesión para crear un podcast.", "code": 401}), 401

    user_id = current_user_id

    if 'audio_file' not in request.files:
        return jsonify({"error": "No se proporcionó ningún archivo de audio.", "code": 400}), 400

    audio_file = request.files['audio_file']
    cover_image_file = request.files.get('cover_image')

    if audio_file.filename == '':
        return jsonify({"error": "No se proporcionó ningún archivo de audio válido.", "code": 400}), 400

    upload_folder = os.path.join(current_app.root_path, 'uploads', 'podcasts')
    os.makedirs(upload_folder, exist_ok=True)

    audio_filename = secure_filename(audio_file.filename)
    audio_file_path = os.path.join(upload_folder, audio_filename)
    audio_file.save(audio_file_path)

    cover_image_filename = None
    if cover_image_file and allowed_file(cover_image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
        cover_image_filename = secure_filename(cover_image_file.filename)
        cover_image_path = os.path.join(upload_folder, cover_image_filename)
        cover_image_file.save(cover_image_path)
    elif cover_image_file and not allowed_file(cover_image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
        return jsonify({"error": "Tipo de archivo de imagen no permitido.", "code": 400}), 400

    try:
        new_podcast = Podcast(
            title=request.form.get('title'),
            description=request.form.get('description'),
            category=request.form.get('category'),
            audio_path=audio_file_path,
            cover_image_path=cover_image_path if cover_image_filename else None,
            user_id=user_id
        )
        db.session.add(new_podcast)
        db.session.commit()
        return jsonify({"message": "Podcast creado con éxito", "podcast_id": new_podcast.id}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        if os.path.exists(audio_file_path):
            os.remove(audio_file_path)
        if cover_image_filename and os.path.exists(cover_image_path):
            os.remove(cover_image_path)
        return jsonify({"error": "Error al crear el podcast: " + str(e), "code": 500}), 500

# CAMBIO 3: Añadir '/podcasts' a la ruta GET para obtener todos
@podcast_bp.route('/podcasts', methods=['GET'], strict_slashes=False) # Añadido /podcasts y strict_slashes=False
@jwt_required()
def get_all_podcasts():
    try:
        podcasts = Podcast.query.all()
        podcast_list = []
        for podcast in podcasts:
            artist_name = podcast.user.name if podcast.user else "Desconocido"

            audio_url = url_for('podcasts.uploaded_file', filename=os.path.basename(podcast.audio_path), _external=True)
            cover_image_url = url_for('podcasts.uploaded_file', filename=os.path.basename(podcast.cover_image_path), _external=True) if podcast.cover_image_path else None

            podcast_list.append({
                'id': podcast.id,
                'title': podcast.title,
                'description': podcast.description,
                'artist': artist_name,
                'genre': podcast.category,
                'audio_url': audio_url,
                'cover_image_url': cover_image_url,
                'created_at': podcast.created_at.isoformat(),
                'user_id': podcast.user_id
            })
        return jsonify(podcasts=podcast_list), 200
    except SQLAlchemyError as e:
        return jsonify({"error": "Error al obtener la lista de podcasts: " + str(e), "code": 500}), 500

# CAMBIO 4: Añadir '/podcasts' a la ruta GET para obtener por ID
@podcast_bp.route('/podcasts/<int:podcast_id>', methods=['GET'], strict_slashes=False) # Añadido /podcasts y strict_slashes=False
@jwt_required()
def get_podcast(podcast_id):
    try:
        podcast = Podcast.query.get(podcast_id)
        if not podcast:
             return jsonify({"error": "Podcast no encontrado.", "code": 404}), 404

        artist_name = podcast.user.name if podcast.user else "Desconocido"

        audio_url = url_for('podcasts.uploaded_file', filename=os.path.basename(podcast.audio_path), _external=True)
        cover_image_url = url_for('podcasts.uploaded_file', filename=os.path.basename(podcast.cover_image_path), _external=True) if podcast.cover_image_path else None

        return jsonify({
            'id': podcast.id,
            'title': podcast.title,
            'description': podcast.description,
            'artist': artist_name,
            'genre': podcast.category,
            'audio_url': audio_url,
            'cover_image_url': cover_image_url,
            'created_at': podcast.created_at.isoformat(),
            'user_id': podcast.user_id
        }), 200
    except SQLAlchemyError as e:
        return jsonify({"error": "Error al obtener el podcast: " + str(e), "code": 500}), 500

# CAMBIO 5: Añadir '/podcasts' a la ruta de archivos subidos
@podcast_bp.route('/podcasts/uploads/<filename>') # Añadido /podcasts
def uploaded_file(filename):
    return send_from_directory(os.path.join(current_app.root_path, 'uploads', 'podcasts'), filename)