# backend/models/user.py

from extensions import db
from sqlalchemy.orm import relationship # ¡Importa esto!
from datetime import datetime # ¡Importa esto!

class User(db.Model):
    # --- ¡CAMBIO AQUÍ! ---
    __tablename__ = 'users' # Asegúrate de que el nombre de la tabla sea explícito y coincida con la referencia en comments.py

    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255))
    profile_picture = db.Column(db.String(500)) # Para guardar la URL de la foto de perfil
    created_at = db.Column(db.DateTime, default=datetime.utcnow) # Si no tenías esta columna, añádela

    # Esto ya lo tenías:
    # podcasts_created es el backref de la relación con Podcast
    # si ya lo tienes definido en Podcast, no lo dupliques aquí.
    # Si no lo tienes en Podcast, puedes usar:
    # podcasts_created = relationship('Podcast', backref='user', lazy=True)

    # Relación con Comment
    comments = relationship('Comment', backref='user', lazy=True)


    def __repr__(self):
        return f'<User {self.email}>'