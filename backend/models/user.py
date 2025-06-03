from ..extensions import db # AHORA IMPORTA db DESDE extensions.py

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255))
    profile_picture = db.Column(db.String(500)) # Para guardar la URL de la foto de perfil

    def __repr__(self):
        return f'<User {self.email}>'