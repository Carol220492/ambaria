from flask import Blueprint, jsonify, request, session, current_app, send_from_directory, url_for
from werkzeug.utils import secure_filename
import os

from models.podcast import Podcast
from models.user import User # Asegúrate de que User esté importado si lo necesitas en otras rutas
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import SQLAlchemyError

# CAMBIO 1: Eliminar url_prefix de la definición de la Blueprint
# Ahora las rutas dentro de la blueprint incluirán el prefijo '/podcasts' explícitamente.
podcast_bp = Blueprint('podcasts', __name__)

# --- FUNCION DE AYUDA PARA EXTENSIONES ---
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'aac', 'flac'}
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

# --- RUTA PARA SERVIR ARCHIVOS SUBIDOS (STATIC) ---
@podcast_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)


# --- RUTA PARA CREAR UN PODCAST (POST) ---
# CAMBIO 2: Añadir '/podcasts' a la ruta POST
@podcast_bp.route('/podcasts', methods=['POST'], strict_slashes=False)
@jwt_required()
def create_podcast():
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return jsonify({"error": "No autenticado. Inicia sesión para crear un podcast.", "code": 401}), 401

    user_id = current_user_id

    if 'audio_file' not in request.files:
        return jsonify({"error": "No se proporcionó un archivo de audio.", "code": 400}), 400

    audio_file = request.files['audio_file']
    if audio_file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo de audio.", "code": 400}), 400

    if not allowed_file(audio_file.filename, ALLOWED_EXTENSIONS):
        return jsonify({"error": "Tipo de archivo de audio no permitido.", "code": 400}), 400

    # Get form data from request.form
    title = request.form.get('title')
    description = request.form.get('description')
    # ARTISTA YA NO ES NECESARIO EN LA ENTRADA, SE ASUME DEL USUARIO LOGUEADO
    category = request.form.get('category')

    # --- AÑADE ESTOS PRINTS PARA DEBUGGING ---
    print(f"DEBUG BACKEND (create_podcast): Recibido - Title: '{title}'")
    print(f"DEBUG BACKEND (create_podcast): Recibido - Description: '{description}'")
    print(f"DEBUG BACKEND (create_podcast): Recibido - Category: '{category}'")
    print(f"DEBUG BACKEND (create_podcast): Contenido completo de request.form: {request.form}")
    print(f"DEBUG BACKEND (create_podcast): Contenido completo de request.files: {request.files}")

    # Ensure all required fields are present (ahora sin 'artist')
    if not all([title, description, category]): # <-- ¡CAMBIO AQUÍ! 'artist' eliminado
        missing_fields = []
        if not title:
            missing_fields.append('título')
        if not description:
            missing_fields.append('descripción')
        if not category:
            missing_fields.append('categoría')
        # Esto imprimirá el error si falla la validación
        print(f"DEBUG BACKEND (create_podcast): Validación fallida. Faltan: {', '.join(missing_fields)}")
        return jsonify({"error": f"Faltan campos requeridos ({', '.join(missing_fields)})", "code": 400}), 400 # <-- Mensaje de error actualizado

    # Guarda el archivo de audio
    audio_filename = secure_filename(audio_file.filename)
    audio_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], audio_filename))
    audio_path = os.path.join(current_app.config['UPLOAD_FOLDER'], audio_filename)

    # Guarda el archivo de imagen de portada (si se proporcionó)
    cover_image_path = None
    if 'cover_image' in request.files and request.files['cover_image'].filename != '':
        cover_image_file = request.files['cover_image']
        if allowed_file(cover_image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
            # Si el podcast tiene una imagen de portada antigua, eliminarla antes de guardar la nueva
            # (aunque aquí se está creando uno nuevo, es una buena práctica si esto se reutiliza)
            # if new_podcast.cover_image_path and os.path.exists(new_podcast.cover_image_path):
            #     os.remove(new_podcast.cover_image_path)

            cover_image_filename = secure_filename(cover_image_file.filename)
            cover_image_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], cover_image_filename))
            cover_image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], cover_image_filename)
        else:
            # Si el tipo de archivo de imagen no es permitido, elimina el archivo de audio ya subido
            if os.path.exists(audio_path):
                os.remove(audio_path)
            return jsonify({"error": "Tipo de archivo de imagen de portada no permitido.", "code": 400}), 400

    try:
        new_podcast = Podcast(
            title=title,
            description=description,
            user_id=user_id, # Esto vincula el podcast al usuario logueado
            category=category,
            audio_path=audio_path,
            cover_image_path=cover_image_path
        )
        db.session.add(new_podcast)
        db.session.commit()
        return jsonify({"message": "Podcast creado con éxito.", "podcast": new_podcast.id}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        # Elimina los archivos si la inserción en la base de datos falla
        if os.path.exists(audio_path):
            os.remove(audio_path)
        if cover_image_path and os.path.exists(cover_image_path):
            os.remove(cover_image_path)
        return jsonify({"error": "Error al crear el podcast: " + str(e), "code": 500}), 500
    except Exception as e:
        # Elimina los archivos si ocurre cualquier otro error inesperado
        if os.path.exists(audio_path):
            os.remove(audio_path)
        if cover_image_path and os.path.exists(cover_image_path):
            os.remove(cover_image_path)
        return jsonify({"error": "Error inesperado al crear el podcast: " + str(e), "code": 500}), 500


# --- RUTA PARA OBTENER TODOS LOS PODCASTS (GET) ---
# CAMBIO: Ahora puede aceptar un filtro por categoría
@podcast_bp.route('/podcasts', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_all_podcasts():
    try:
        category_filter = request.args.get('category') # Obtener el parámetro de categoría de la URL
        
        query = Podcast.query
        if category_filter and category_filter != 'All': # Si hay un filtro y no es 'All'
            query = query.filter_by(category=category_filter)

        podcasts = query.all() # Ejecutar la consulta
        
        podcasts_data = []
        for podcast in podcasts:
            artist_name = podcast.user.name if podcast.user else "Desconocido"
            
            # Generar URLs completas para los archivos
            audio_url = url_for('podcasts.uploaded_file', filename=os.path.basename(podcast.audio_path), _external=True)
            cover_image_url = url_for('podcasts.uploaded_file', filename=os.path.basename(podcast.cover_image_path), _external=True) if podcast.cover_image_path else None

            podcasts_data.append({
                'id': podcast.id,
                'title': podcast.title,
                'description': podcast.description,
                'artist': artist_name, # Ahora 'artist' se obtiene del usuario
                'category': podcast.category,
                'audio_url': audio_url,
                'cover_image_url': cover_image_url,
                'created_at': podcast.created_at.isoformat(),
                'user_id': podcast.user_id
            })
        return jsonify({"podcasts": podcasts_data}), 200
    except SQLAlchemyError as e:
        return jsonify({"error": "Error al obtener los podcasts: " + str(e), "code": 500}), 500


# --- RUTA PARA OBTENER UN SOLO PODCAST POR ID (GET) ---
@podcast_bp.route('/podcasts/<int:podcast_id>', methods=['GET'], strict_slashes=False)
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
            'category': podcast.category,
            'audio_url': audio_url,
            'cover_image_url': cover_image_url,
            'created_at': podcast.created_at.isoformat(),
            'user_id': podcast.user_id
        }), 200
    except SQLAlchemyError as e:
        return jsonify({"error": "Error al obtener el podcast: " + str(e), "code": 500}), 500


# --- RUTA PARA OBTENER LOS PODCASTS DEL USUARIO ACTUAL (GET) ---
@podcast_bp.route('/podcasts/my_podcasts', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_my_podcasts():
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return jsonify({"error": "No autenticado. Inicia sesión para ver tus podcasts.", "code": 401}), 401

    try:
        user_podcasts = Podcast.query.filter_by(user_id=current_user_id).all()
        podcasts_data = []
        for podcast in user_podcasts:
            artist_name = podcast.user.name if podcast.user else "Desconocido"
            audio_url = url_for('podcasts.uploaded_file', filename=os.path.basename(podcast.audio_path), _external=True)
            cover_image_url = url_for('podcasts.uploaded_file', filename=os.path.basename(podcast.cover_image_path), _external=True) if podcast.cover_image_path else None

            podcasts_data.append({
                'id': podcast.id,
                'title': podcast.title,
                'description': podcast.description,
                'artist': artist_name,
                'category': podcast.category,
                'audio_url': audio_url,
                'cover_image_url': cover_image_url,
                'created_at': podcast.created_at.isoformat(),
                'user_id': podcast.user_id
            })
        return jsonify({"podcasts": podcasts_data}), 200
    except SQLAlchemyError as e:
        return jsonify({"error": "Error al obtener tus podcasts: " + str(e), "code": 500}), 500


# --- RUTA PARA ELIMINAR UN PODCAST (DELETE) ---
@podcast_bp.route('/podcasts/<int:podcast_id>', methods=['DELETE'], strict_slashes=False)
@jwt_required()
def delete_podcast(podcast_id):
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return jsonify({"error": "No autenticado."}), 401

    try:
        user_id_int = int(current_user_id)
    except ValueError:
        return jsonify({"error": "ID de usuario inválido en el token."}), 400

    try:
        podcast = Podcast.query.get(podcast_id)
        if not podcast:
            return jsonify({"error": "Podcast no encontrado."}), 404

        if podcast.user_id != user_id_int:
            return jsonify({"error": "No tienes permiso para eliminar este podcast."}), 403

        if podcast.audio_path and os.path.exists(podcast.audio_path):
            os.remove(podcast.audio_path)
            print(f"DEBUG: Archivo de audio eliminado: {podcast.audio_path}")
        if podcast.cover_image_path and os.path.exists(podcast.cover_image_path):
            os.remove(podcast.cover_image_path)
            print(f"DEBUG: Archivo de portada eliminado: {podcast.cover_image_path}")

        db.session.delete(podcast)
        db.session.commit()

        return jsonify({"message": "Podcast eliminado con éxito."}), 200

    except ValueError:
        return jsonify({"error": "ID de usuario inválido en el token."}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error al eliminar el podcast de la BD: {e}")
        return jsonify({"error": "Error al eliminar el podcast.", "details": str(e)}), 500
    except Exception as e:
        current_app.logger.error(f"Error inesperado al eliminar podcast: {e}")
        return jsonify({"error": "Error interno del servidor al eliminar el podcast."}), 500


# --- RUTA PARA EDITAR UN PODCAST (PUT/PATCH) ---
@podcast_bp.route('/podcasts/<int:podcast_id>', methods=['PUT'], strict_slashes=False)
@jwt_required()
def update_podcast(podcast_id):
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return jsonify({"error": "No autenticado."}), 401

    try:
        user_id_int = int(current_user_id)
    except ValueError:
        return jsonify({"error": "ID de usuario inválido en el token."}), 400

    try:
        podcast = Podcast.query.get(podcast_id)
        if not podcast:
            return jsonify({"error": "Podcast no encontrado."}), 404

        if podcast.user_id != user_id_int:
            return jsonify({"error": "No tienes permiso para editar este podcast."}), 403

        title = request.form.get('title')
        description = request.form.get('description')
        category = request.form.get('category')

        if title:
            podcast.title = title
        if description:
            podcast.description = description
        if category:
            podcast.category = category

        if 'audio_file' in request.files and request.files['audio_file'].filename != '':
            new_audio_file = request.files['audio_file']
            if allowed_file(new_audio_file.filename, ALLOWED_EXTENSIONS):
                if podcast.audio_path and os.path.exists(podcast.audio_path):
                    os.remove(podcast.audio_path)
                audio_filename = secure_filename(new_audio_file.filename)
                new_audio_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], audio_filename))
                podcast.audio_path = os.path.join(current_app.config['UPLOAD_FOLDER'], audio_filename)
            else:
                return jsonify({"error": "Tipo de archivo de audio no permitido para la actualización."}), 400

        if 'cover_image' in request.files and request.files['cover_image'].filename != '':
            new_cover_image_file = request.files['cover_image']
            if allowed_file(new_cover_image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
                if podcast.cover_image_path and os.path.exists(podcast.cover_image_path):
                    os.remove(podcast.cover_image_path)
                cover_image_filename = secure_filename(new_cover_image_file.filename)
                new_cover_image_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], cover_image_filename))
                podcast.cover_image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], cover_image_filename)
            else:
                return jsonify({"error": "Tipo de archivo de imagen de portada no permitido para la actualización."}), 400

        db.session.commit()
        return jsonify({"message": "Podcast actualizado con éxito."}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar el podcast: " + str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Error inesperado al actualizar el podcast: " + str(e)}), 500

# --- NUEVA RUTA: Obtener categorías únicas ---
@podcast_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_podcast_categories():
    try:
        # Aquí asumo que estás usando SQLAlchemy con la base de datos que ya tienes.
        # Si usaras MongoDB, la consulta sería diferente (ej. current_app.mongo.db.podcasts.distinct('category')).
        
        # Obtener todas las categorías únicas de la columna 'category'
        categories = db.session.query(Podcast.category).distinct().all()
        
        # Extraer los valores de las tuplas y limpiar/ordenar
        categories_list = sorted([cat[0] for cat in categories if cat[0]]) # Elimina None y ordena
        
        return jsonify({'categories': categories_list}), 200
    except SQLAlchemyError as e:
        current_app.logger.error(f"Error al obtener categorías de podcasts de la BD: {e}")
        return jsonify({'error': 'Error interno del servidor al obtener categorías'}), 500
    except Exception as e:
        current_app.logger.error(f"Error inesperado al obtener categorías de podcasts: {e}")
        return jsonify({'error': 'Error inesperado al obtener categorías'}), 500