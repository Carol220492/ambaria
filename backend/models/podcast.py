# backend/models/podcast.py

from backend.extensions import db

class Podcast(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    artist = db.Column(db.String(100), nullable=False) # Nuevo campo
    genre = db.Column(db.String(50), nullable=False)   # Nuevo campo (reemplaza o complementa a 'category')
    description = db.Column(db.Text)
    audio_path = db.Column(db.String(255), nullable=False)
    cover_image_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Podcast {self.title} by {self.artist}>'