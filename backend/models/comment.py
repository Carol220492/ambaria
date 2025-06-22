# backend/models/comment.py
from datetime import datetime
from extensions import db

class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    # ¡CAMBIO CRÍTICO AQUÍ! onDelete='CASCADE' en la definición de la clave foránea.
    # Esto le dice a la base de datos PostgreSQL que elimine automáticamente
    # los comentarios cuando el podcast_id al que se refieren sea eliminado.
    podcast_id = db.Column(db.Integer, db.ForeignKey('podcasts.id', ondelete='CASCADE'), nullable=False)


    def __repr__(self):
        return f'<Comment {self.id} by User {self.user_id} on Podcast {self.podcast_id}>'

    def to_dict(self):
        username = self.user.name if self.user else "Desconocido"
        profile_picture = self.user.profile_picture if self.user else None
        
        return {
            'id': self.id,
            'text': self.text,
            'user_id': self.user_id,
            'username': username,
            'profile_picture': profile_picture,
            'podcast_id': self.podcast_id,
            'created_at': self.created_at.isoformat() + 'Z'
        }