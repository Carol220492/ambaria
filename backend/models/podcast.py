from flask import Blueprint, jsonify
from ..extensions import db # AHORA IMPORTA db DESDE extensions.py

class Podcast(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False)
    audio_path = db.Column(db.String(255), nullable=False)
    cover_image_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __repr__(self):
        return f'<Podcast {self.title}>'