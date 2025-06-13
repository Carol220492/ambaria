# backend/models/podcast.py

from backend.extensions import db
from sqlalchemy.orm import relationship # ¡IMPORTA ESTO!

class Podcast(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    # artist = db.Column(db.String(100), nullable=False) # Si ya tienes user.name, este puede ser redundante.
    # genre = db.Column(db.String(50), nullable=False)   # Si 'category' ya existe y se usa como género, puedes mantenerlo.
    description = db.Column(db.Text)
    audio_path = db.Column(db.String(255), nullable=False)
    cover_image_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category = db.Column(db.String(50)) # Mantén este campo si lo usas para el género

    # ¡AÑADE ESTA LÍNEA (o asegúrate de que esté correctamente)!
    # Esto crea el atributo 'user' en el objeto Podcast
    user = relationship('User', backref='podcasts_created', lazy=True)

    def __repr__(self):
        # Asegúrate de que 'user' pueda ser None para evitar errores si un podcast no tiene un usuario (aunque user_id es nullable=False)
        return f'<Podcast {self.title} by {self.user.name if self.user else "Unknown User"}>'