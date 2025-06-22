from flask import Blueprint, jsonify, request, current_app, send_from_directory, url_for
from werkzeug.utils import secure_filename
import os

from models.podcast import Podcast
from models.user import User
from models.comment import Comment # Asegúrate de que Comment esté importado
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import SQLAlchemyError

podcast_bp = Blueprint('podcasts', __name__)

# --- FUNCIONES DE AYUDA PARA EXTENSIONES ---
ALLOWED_AUDIO_EXTENSIONS = {'mp3', 'wav', 'ogg', 'aac', 'flac'}
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

# --- RUTA PARA SERVIR ARCHIVOS SUBIDOS (¡LOCALMENTE DESDE RENDER!) ---
@podcast_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    print(f"DEBUG BACKEND: Sirviendo archivo desde UPLOAD_FOLDER: {filename}")
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)


# --- RUTA PARA CREAR UN PODCAST (POST) ---
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

    if not allowed_file(audio_file.filename, ALLOWED_AUDIO_EXTENSIONS):
        return jsonify({"error": "Tipo de archivo de audio no permitido.", "code": 400}), 400

    title = request.form.get('title')
    description = request.form.get('description')
    category = request.form.get('category')

    if not all([title, description, category]):
        missing_fields = []
        if not title: missing_fields.append('título')
        if not description: missing_fields.append('descripción')
        if not category: missing_fields.append('categoría')
        return jsonify({"error": f"Faltan campos requeridos ({', '.join(missing_fields)})", "code": 400}), 400

    audio_path = None
    cover_image_path = None

    try:
        # --- GUARDAR AUDIO LOCALMENTE ---
        audio_filename = secure_filename(audio_file.filename)
        audio_path = os.path.join(current_app.config['UPLOAD_FOLDER'], audio_filename)
        audio_file.save(audio_path)
        print(f"DEBUG BACKEND: Audio guardado localmente en: {audio_path}")


        # --- GUARDAR IMAGEN DE PORTADA LOCALMENTE (si se proporciona) ---
        if 'cover_image' in request.files and request.files['cover_image'].filename != '':
            cover_image_file = request.files['cover_image']
            if allowed_file(cover_image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
                cover_image_filename = secure_filename(cover_image_file.filename)
                cover_image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], cover_image_filename)
                cover_image_file.save(cover_image_path)
                print(f"DEBUG BACKEND: Imagen guardada localmente en: {cover_image_path}")
            else:
                if audio_path and os.path.exists(audio_path):
                    os.remove(audio_path)
                return jsonify({"error": "Tipo de archivo de imagen de portada no permitido.", "code": 400}), 400

        new_podcast = Podcast(
            title=title,
            description=description,
            user_id=user_id,
            category=category,
            audio_path=audio_path,
            cover_image_path=cover_image_path
        )
        db.session.add(new_podcast)
        db.session.commit()
        return jsonify({"message": "Podcast creado con éxito.", "podcast_id": new_podcast.id, "audio_url": url_for('podcasts.uploaded_file', filename=os.path.basename(new_podcast.audio_path), _external=True), "cover_image_url": url_for('podcasts.uploaded_file', filename=os.path.basename(new_podcast.cover_image_path), _external=True) if new_podcast.cover_image_path else None}), 201
    except Exception as e:
        db.session.rollback()
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)
        if cover_image_path and os.path.exists(cover_image_path):
            os.remove(cover_image_path)
        current_app.logger.error(f"Error al crear el podcast (local save/DB): {e}")
        return jsonify({"error": "Error al subir el podcast: " + str(e), "code": 500}), 500


# --- RUTA PARA OBTENER TODOS LOS PODCASTS (GET) ---
@podcast_bp.route('/podcasts', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_all_podcasts():
    try:
        category_filter = request.args.get('category')
        
        query = Podcast.query
        if category_filter and category_filter != 'All':
            query = query.filter_by(category=category_filter)

        podcasts = query.all()
        
        podcasts_data = []
        for podcast in podcasts:
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
        current_app.logger.error(f"Error al obtener los podcasts de la BD: {e}")
        return jsonify({"error": "Error al obtener los podcasts: " + str(e), "code": 500}), 500
    except Exception as e:
        current_app.logger.error(f"Error inesperado al obtener los podcasts: {e}")
        return jsonify({"error": "Error inesperado del servidor: " + str(e), "code": 500}), 500


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
        current_app.logger.error(f"Error al obtener el podcast de la BD: {e}")
        return jsonify({"error": "Error al obtener el podcast: " + str(e), "code": 500}), 500
    except Exception as e:
        current_app.logger.error(f"Error inesperado al obtener el podcast: {e}")
        return jsonify({"error": "Error inesperado del servidor: " + str(e), "code": 500}), 500


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
        current_app.logger.error(f"Error al obtener tus podcasts de la BD: {e}")
        return jsonify({"error": "Error al obtener tus podcasts: " + str(e), "code": 500}), 500
    except Exception as e:
        current_app.logger.error(f"Error inesperado al obtener tus podcasts: {e}")
        return jsonify({"error": "Error inesperado del servidor: " + str(e), "code": 500}), 500


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

        # --- ¡PASO EXTRA DE SEGURIDAD! BORRAR COMENTARIOS ASOCIADOS EXPLICITAMENTE ---
        # Esto es un respaldo por si el CASCADE DELETE de la DB no se aplica o se revierte.
        # Aquí es donde busco y borro los comentarios ANTES de borrar el podcast.
        associated_comments = Comment.query.filter_by(podcast_id=podcast_id).all()
        for comment in associated_comments:
            db.session.delete(comment)
        db.session.commit() # ¡Commit los comentarios antes de eliminar el podcast!

        # Eliminar los archivos localmente de Render
        if podcast.audio_path and os.path.exists(podcast.audio_path):
            os.remove(podcast.audio_path)
            print(f"DEBUG: Archivo de audio eliminado: {podcast.audio_path}")
        if podcast.cover_image_path and os.path.exists(podcast.cover_image_path):
            os.remove(podcast.cover_image_path)
            print(f"DEBUG: Archivo de portada eliminado: {podcast.cover_image_path}")

        db.session.delete(podcast)
        db.session.commit()

        return jsonify({"message": "Podcast eliminado con éxito."}), 200

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
            if allowed_file(new_audio_file.filename, ALLOWED_AUDIO_EXTENSIONS): # Usar ALLOWED_AUDIO_EXTENSIONS
                if podcast.audio_path and os.path.exists(podcast.audio_path):
                    os.remove(podcast.audio_path)
                audio_filename = secure_filename(new_audio_file.filename)
                new_audio_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], audio_filename))
                podcast.audio_path = os.path.join(current_app.config['UPLOAD_FOLDER'], audio_filename)
                print(f"DEBUG BACKEND: Audio actualizado localmente en: {podcast.audio_path}")
            else:
                return jsonify({"error": "Tipo de archivo de audio no permitido para la actualización."}), 400

        if 'cover_image' in request.files and request.files['cover_image'].filename != '':
            new_cover_image_file = request.files['cover_image']
            if allowed_file(new_cover_image_file.filename, ALLOWED_IMAGE_EXTENSIONS): # Usar ALLOWED_IMAGE_EXTENSIONS
                if podcast.cover_image_path and os.path.exists(podcast.cover_image_path):
                    os.remove(podcast.cover_image_path)
                cover_image_filename = secure_filename(new_cover_image_file.filename)
                new_cover_image_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], cover_image_filename))
                podcast.cover_image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], cover_image_filename)
                print(f"DEBUG BACKEND: Imagen actualizada localmente en: {podcast.cover_image_path}")
            else:
                return jsonify({"error": "Tipo de archivo de imagen de portada no permitido para la actualización."}), 400

        db.session.commit()
        return jsonify({"message": "Podcast actualizado con éxito."}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error al actualizar el podcast de la BD: {e}")
        return jsonify({"error": "Error al actualizar el podcast: " + str(e)}), 500
    except Exception as e:
        current_app.logger.error(f"Error inesperado al actualizar el podcast: {e}")
        return jsonify({"error": "Error inesperado al actualizar el podcast: " + str(e)}), 500

# --- NUEVA RUTA: Obtener categorías únicas ---
@podcast_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_podcast_categories():
    try:
        categories = db.session.query(Podcast.category).distinct().all()
        categories_list = sorted([cat[0] for cat in categories if cat[0]])
        return jsonify({'categories': categories_list}), 200
    except SQLAlchemyError as e:
        current_app.logger.error(f"Error al obtener categorías de podcasts de la BD: {e}")
        return jsonify({'error': 'Error interno del servidor al obtener categorías'}), 500
    except Exception as e:
        current_app.logger.error(f"Error inesperado al obtener categorías de podcasts: {e}")
        return jsonify({'error': 'Error inesperado al obtener categorías'}), 500