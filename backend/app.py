from flask import Flask, jsonify, request  # Importamos request
import os
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_pyfile('config.py')

db = SQLAlchemy(app)
from .models.podcast import Podcast
from .routes.upload_routes import upload_bp
from .routes.podcast_routes import podcast_bp

app.register_blueprint(upload_bp, url_prefix='/')
app.register_blueprint(podcast_bp, url_prefix='/podcasts')

@app.route('/')
def hello():
    try:
        resultado = 10 / 0
        return "Resultado: {}".format(resultado)
    except ZeroDivisionError:
        return jsonify({"error": "¡Error! División por cero.", "code": 400}), 400

@app.route('/podcasts', methods=['POST'])  # Ruta hipotética para crear podcasts
def create_podcast():
    try:
        data = request.get_json()  # Obtener datos del cuerpo de la solicitud (asumimos JSON)
        if not data or 'title' not in data or 'description' not in data:
            return jsonify({"error": "Faltan datos requeridos.", "code": 400}), 400

        new_podcast = Podcast(title=data['title'], description=data['description'])
        db.session.add(new_podcast)
        db.session.commit()
        return jsonify({"message": "Podcast creado con éxito.", "code": 201}), 201  # 201 Created

    except Exception as e:  # Capturar cualquier excepción
        db.session.rollback()  # Revertir cualquier cambio en la base de datos
        return jsonify({"error": str(e), "code": 500}), 500  # 500 Internal Server Error

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'])