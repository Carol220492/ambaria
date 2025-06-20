# backend/models/podcast.py

from extensions import db
from sqlalchemy.orm import relationship
from datetime import datetime # ¡Asegúrate de que esta importación exista si usas datetime.utcnow()!

class Podcast(db.Model):
    # --- ¡CAMBIO AQUÍ! ---
    __tablename__ = 'podcasts' # Asegúrate de que el nombre de la tabla sea explícito y coincida con la referencia en comments.py

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    audio_path = db.Column(db.String(255), nullable=False)
    cover_image_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False) # Asegúrate de que este ForeignKey sea a 'users.id' (plural)
    category = db.Column(db.String(50))

    user = relationship('User', backref='podcasts_created', lazy=True)

    # Relación con Comment
    comments = relationship('Comment', backref='podcast', lazy=True)


    def __repr__(self):
        return f'<Podcast {self.title}>'