from flask import Blueprint, jsonify
from ..models.podcast import Podcast
from ..app import db  # Importamos db desde app.py
from sqlalchemy.orm.exc import NoResultFound  # Importamos la excepción específica de SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError # Importamos la excepción general de SQLAlchemy

podcast_bp = Blueprint('podcasts', __name__, url_prefix='/podcasts')

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
                'created_at': podcast.created_at.isoformat()
            })
        return jsonify(podcasts=podcast_list), 200  # Devolvemos 200 OK en caso de éxito
    except SQLAlchemyError as e:
        return jsonify({"error": "Error al obtener la lista de podcasts: " + str(e), "code": 500}), 500

@podcast_bp.route('/<int:podcast_id>', methods=['GET'])
def get_podcast(podcast_id):
    try:
        podcast = Podcast.query.get_or_404(podcast_id)  # Usamos get_or_404
        return jsonify({
            'id': podcast.id,
            'title': podcast.title,
            'description': podcast.description,
            'category': podcast.category,
            'audio_path': podcast.audio_path,
            'cover_image_path': podcast.cover_image_path,
            'created_at': podcast.created_at.isoformat()
        }), 200  # Devolvemos 200 OK
    except NoResultFound:  # Capturamos la excepción específica
        return jsonify({"error": "Podcast no encontrado", "code": 404}), 404
    except SQLAlchemyError as e:
        return jsonify({"error": "Error al obtener el podcast: " + str(e), "code": 500}), 500