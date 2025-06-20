# backend/routes/comment_routes.py
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.comment import Comment
from models.podcast import Podcast
from models.user import User # Necesario para la relación inversa y obtener nombre de usuario
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime # Asegúrate de que datetime esté importado si lo usas directamente

comment_bp = Blueprint('comments', __name__, url_prefix='/api') # Prefijo para todas las rutas de este blueprint

# --- RUTA PARA AÑADIR UN COMENTARIO A UN PODCAST (POST) ---
@comment_bp.route('/podcasts/<int:podcast_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(podcast_id):
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return jsonify({"error": "No autenticado. Inicia sesión para comentar."}), 401

    try:
        user_id_int = int(current_user_id)
    except ValueError:
        return jsonify({"error": "ID de usuario inválido en el token."}), 400

    podcast = Podcast.query.get(podcast_id)
    if not podcast:
        return jsonify({"error": "Podcast no encontrado."}), 404

    data = request.get_json()
    comment_text = data.get('text', '').strip()

    if not comment_text:
        return jsonify({"error": "El comentario no puede estar vacío."}), 400

    try:
        new_comment = Comment(
            text=comment_text,
            user_id=user_id_int,
            podcast_id=podcast_id,
            created_at=datetime.utcnow() # Usa datetime.utcnow() para la marca de tiempo
        )
        db.session.add(new_comment)
        db.session.commit()

        # Usamos to_dict() para la respuesta, que ya incluye username y profile_picture
        return jsonify({"message": "Comentario añadido con éxito.", "comment": new_comment.to_dict()}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error al añadir comentario a la BD: {e}")
        return jsonify({"error": "Error interno al añadir el comentario.", "details": str(e)}), 500
    except Exception as e:
        current_app.logger.error(f"Error inesperado al añadir comentario: {e}")
        return jsonify({"error": "Error interno del servidor."}), 500

# --- RUTA PARA OBTENER LOS COMENTARIOS DE UN PODCAST (GET) ---
@comment_bp.route('/podcasts/<int:podcast_id>/comments', methods=['GET'])
def get_comments(podcast_id):
    podcast = Podcast.query.get(podcast_id)
    if not podcast:
        return jsonify({"error": "Podcast no encontrado."}), 404

    try:
        # Ordenar comentarios por fecha de creación descendente (más recientes primero)
        comments = Comment.query.filter_by(podcast_id=podcast_id).order_by(Comment.created_at.desc()).all()
        # Convertir cada objeto Comment a su representación de diccionario
        comments_data = [comment.to_dict() for comment in comments]
        return jsonify({"comments": comments_data}), 200
    except SQLAlchemyError as e:
        current_app.logger.error(f"Error al obtener comentarios de la BD: {e}")
        return jsonify({"error": "Error interno al obtener los comentarios.", "details": str(e)}), 500
    except Exception as e:
        current_app.logger.error(f"Error inesperado al obtener comentarios: {e}")
        return jsonify({"error": "Error interno del servidor."}), 500

# --- RUTA PARA ELIMINAR UN COMENTARIO (OPCIONAL, PERO RECOMENDADO) ---
@comment_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return jsonify({"error": "No autenticado."}), 401

    try:
        user_id_int = int(current_user_id)
    except ValueError:
        return jsonify({"error": "ID de usuario inválido en el token."}), 400

    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({"error": "Comentario no encontrado."}), 404

    # Solo el usuario que creó el comentario puede eliminarlo
    if comment.user_id != user_id_int:
        return jsonify({"error": "No tienes permiso para eliminar este comentario."}), 403 # Forbidden

    try:
        db.session.delete(comment)
        db.session.commit()
        return jsonify({"message": "Comentario eliminado con éxito."}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Error al eliminar comentario de la BD: {e}")
        return jsonify({"error": "Error interno al eliminar el comentario.", "details": str(e)}), 500
    except Exception as e:
        current_app.logger.error(f"Error inesperado al eliminar comentario: {e}")
        return jsonify({"error": "Error interno del servidor."}), 500