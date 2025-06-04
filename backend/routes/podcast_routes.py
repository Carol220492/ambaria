from flask import Blueprint, jsonify, request, session, current_app, send_from_directory
from werkzeug.utils import secure_filename
import os

from backend.models.podcast import Podcast
from backend.extensions import db

from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import SQLAlchemyError

podcast_bp = Blueprint('podcasts', __name__, url_prefix='/podcasts')

# Define los tipos de archivos permitidos
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'aac', 'flac'}
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

@podcast_bp.route('/', methods=['POST'])
def create_podcast():
    # Asegúrate de que el usuario esté autenticado
     if 'user_id' not in session: # <--- ¡COMENTA ESTA LÍNEA!
    #    return jsonify({"error": "No autenticado. Inicia sesión para crear un podcast.", "code": 401}), 401

    #user_id = 1 # <--- ¡DESCOMENTA Y USA ESTA LÍNEA TEMPORALMENTE PARA LA PRUEBA! (Asegúrate de que haya un usuario con ID 1 en tu tabla 'user' si ya la creaste)

    # Si no se envía ningún archivo en la solicitud
    if 'audio_file' not in request.files:
        return jsonify({"error": "No se proporcionó ningún archivo de audio.", "code": 400}), 400

    audio_file = request.files['audio_file']
    cover_image_file = request.files.get('cover_image')

    # Validar si se seleccionó un archivo y tiene un nombre
    if audio_file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo de audio.", "code": 400}), 400

    # Validar el tipo de archivo de audio
    if not allowed_file(audio_file.filename, ALLOWED_EXTENSIONS):
        return jsonify({"error": "Tipo de archivo de audio no permitido.", "code": 400}), 400

    # Obtener los datos del formulario (título, descripción, categoría)
    title = request.form.get('title')
    description = request.form.get('description')
    category = request.form.get('category')

    if not title or not description or not category:
        return jsonify({"error": "Faltan datos requeridos (título, descripción o categoría).", "code": 400}), 400

    try:
        # Asegúrate de que la carpeta de subidas exista
        upload_folder = os.path.join(current_app.root_path, current_app.config['UPLOAD_FOLDER'])
        os.makedirs(upload_folder, exist_ok=True)

        # Guardar el archivo de audio
        audio_filename = secure_filename(audio_file.filename)
        audio_filepath = os.path.join(upload_folder, audio_filename)
        audio_file.save(audio_filepath)

        cover_image_filepath = None
        if cover_image_file and cover_image_file.filename != '':
            if allowed_file(cover_image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
                image_filename = secure_filename(cover_image_file.filename)
                cover_image_filepath = os.path.join(upload_folder, image_filename)
                cover_image_file.save(cover_image_filepath)
            else:
                return jsonify({"error": "Tipo de archivo de imagen de portada no permitido.", "code": 400}), 400

        # Crear y guardar el nuevo podcast en la base de datos
        new_podcast = Podcast(
            title=title,
            description=description,
            category=category,
            audio_path=os.path.join(current_app.config['UPLOAD_FOLDER'], audio_filename),
            cover_image_path=os.path.join(current_app.config['UPLOAD_FOLDER'], image_filename) if cover_image_filepath else None,
            user_id=user_id # Asignar el ID del usuario logueado (ahora fijo en 1)
        )
        db.session.add(new_podcast)
        db.session.commit()

        return jsonify({
            "message": "Podcast creado con éxito.",
            "podcast_id": new_podcast.id,
            "title": new_podcast.title,
            "audio_path": new_podcast.audio_path
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error al crear podcast: {e}")
        return jsonify({"error": "Error interno del servidor al crear el podcast: " + str(e), "code": 500}), 500


@podcast_bp.route('/', methods=['GET'])
def get_podcasts():
    try:
        podcasts = Podcast.query.all()
        podcast_list = []
        for podcast in podcasts:
            podcast_list.append({
                'id': podcast.id,
                'title': podcast.title,
                'description': podcast.description,
                'category': podcast.category,
                'audio_path': podcast.audio_path,
                'cover_image_path': podcast.cover_image_path,
                'created_at': podcast.created_at.isoformat(),
                'user_id': podcast.user_id
            })
        return jsonify(podcasts=podcast_list), 200
    except SQLAlchemyError as e:
        return jsonify({"error": "Error al obtener la lista de podcasts: " + str(e), "code": 500}), 500

@podcast_bp.route('/<int:podcast_id>', methods=['GET'])
def get_podcast(podcast_id):
    try:
        podcast = Podcast.query.get_or_404(podcast_id)
        return jsonify({
            'id': podcast.id,
            'title': podcast.title,
            'description': podcast.description,
            'category': podcast.category,
            'audio_path': podcast.audio_path,
            'cover_image_path': podcast.cover_image_path,
            'created_at': podcast.created_at.isoformat(),
            'user_id': podcast.user_id
        }), 200
    except NoResultFound:
        return jsonify({"error": "Podcast no encontrado", "code": 404}), 404
    except SQLAlchemyError as e:
        return jsonify({"error": "Error al obtener el podcast: " + str(e), "code": 500}), 500

@podcast_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    upload_folder = os.path.join(current_app.root_path, current_app.config['UPLOAD_FOLDER'])
    return send_from_directory(upload_folder, filename)