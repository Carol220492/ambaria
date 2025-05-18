from flask import Blueprint, request, render_template, current_app, jsonify
from werkzeug.utils import secure_filename
from ..models.podcast import Podcast
from ..app import db  # Importamos db desde app.py
from os import path,  remove
from sqlalchemy.exc import SQLAlchemyError  # Importamos la excepción de SQLAlchemy
import os

upload_bp = Blueprint('upload', __name__, url_prefix='/')

ALLOWED_AUDIO_EXTENSIONS = {'mp3', 'wav'}
ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png'}

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

@upload_bp.route('/upload', methods=['GET', 'POST'])
def upload_podcast():
    if request.method == 'POST':
        try:
            if 'audio_file' not in request.files:
                return jsonify({"error": "No se ha enviado ningún archivo de audio", "code": 400}), 400

            audio_file = request.files['audio_file']

            if audio_file.filename == '':
                return jsonify({"error": "No se ha seleccionado ningún archivo de audio", "code": 400}), 400

            if audio_file and allowed_file(audio_file.filename, ALLOWED_AUDIO_EXTENSIONS):
                filename = secure_filename(audio_file.filename)
                audio_path = path.join(current_app.config['UPLOAD_FOLDER'], filename)
                audio_file.save(audio_path)

                title = request.form['title']
                description = request.form['description']
                category = request.form['category']
                cover_image = request.files.get('cover_image')

                cover_image_filename = None
                cover_image_path = None
                if cover_image and cover_image.filename != '' and allowed_file(cover_image.filename, ALLOWED_IMAGE_EXTENSIONS):
                    cover_image_filename = secure_filename(cover_image.filename)
                    cover_image_path = path.join(current_app.config['UPLOAD_FOLDER'], cover_image_filename)
                    cover_image.save(cover_image_path)

                new_podcast = Podcast(
                    title=title,
                    description=description,
                    category=category,
                    audio_path=audio_path,
                    cover_image_path=cover_image_path
                )
                db.session.add(new_podcast)
                db.session.commit()
                return jsonify({"message": "¡Podcast subido y guardado en la base de datos con éxito!", "code": 201}), 201

            else:
                return jsonify({"error": "Tipo de archivo de audio no permitido", "code": 400}), 400

        except SQLAlchemyError as db_error:
            db.session.rollback()
            # Eliminar archivos subidos si falla la base de datos
            if 'audio_path' in locals() and os.path.exists(audio_path):
                os.remove(audio_path)
            if 'cover_image_path' in locals() and os.path.exists(cover_image_path):
                os.remove(cover_image_path)
            return jsonify({"error": "Error de base de datos: " + str(db_error), "code": 500}), 500
        except Exception as e:
            # Eliminar archivos subidos si ocurre un error inesperado
            if 'audio_path' in locals() and os.path.exists(audio_path):
                os.remove(audio_path)
            if 'cover_image_path' in locals() and os.path.exists(cover_image_path):
                os.remove(cover_image_path)
            return jsonify({"error": "Error al subir el podcast: " + str(e), "code": 500}), 500

    return render_template('upload_form.html')