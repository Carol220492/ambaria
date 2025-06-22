from extensions import db
from sqlalchemy.orm import relationship
from datetime import datetime 

class Podcast(db.Model):
    __tablename__ = 'podcasts' 

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    # Mantenemos longitud mayor por si volvemos a GCS o rutas largas
    audio_path = db.Column(db.String(500), nullable=False) 
    cover_image_path = db.Column(db.String(500)) 
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category = db.Column(db.String(50))

    user = relationship('User', backref='podcasts_created', lazy=True)

    # Relación con Comment - ¡Añadimos cascade='all, delete-orphan' para eliminar comentarios!
    # Esto asegura que al borrar un podcast, se borren sus comentarios relacionados a nivel de ORM.
    comments = relationship('Comment', backref='podcast', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Podcast {self.title}>'