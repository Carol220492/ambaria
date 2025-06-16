# backend/models/comment.py
from datetime import datetime
from backend.extensions import db

class Comment(db.Model):
    __tablename__ = 'comments'  # Nombre de la tabla en la base de datos
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Claves foráneas
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    podcast_id = db.Column(db.Integer, db.ForeignKey('podcasts.id'), nullable=False)

    # Relaciones (opcionales, pero útiles para acceder a datos relacionados)
    # Estas se definen con backref, que crea la relación inversa en User y Podcast
    # No necesitas definir user o podcast aquí si la relación se maneja con backref en los otros modelos
    # user = db.relationship('User', backref=db.backref('comments', lazy=True))
    # podcast = db.relationship('Podcast', backref=db.backref('comments', lazy=True))


    def __repr__(self):
        return f'<Comment {self.id} by User {self.user_id} on Podcast {self.podcast_id}>'

    def to_dict(self):
        # Asegúrate de que user esté cargado si vas a acceder a user.name/profile_picture
        # Esto es más seguro si la relación user está definida con lazy='joined' o similar,
        # o si se carga previamente. Si no, podrías necesitar una consulta separada
        # o manejar el caso donde user es None si el lazy es true y no se carga.
        username = self.user.name if self.user else "Desconocido"
        profile_picture = self.user.profile_picture if self.user else None
        
        return {
            'id': self.id,
            'text': self.text,
            'user_id': self.user_id,
            'username': username,
            'profile_picture': profile_picture,
            'podcast_id': self.podcast_id,
            'created_at': self.created_at.isoformat() + 'Z' # Formato ISO 8601 con Z para UTC
        }