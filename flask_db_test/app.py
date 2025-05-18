from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'test.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class TestModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(255))

def create_tables():
    with app.app_context():
        print("Intentando crear las tablas...")
        db.create_all()
        print("Tablas creadas.")

first_request_done = False

@app.before_request
def before_request():
    global first_request_done
    if not first_request_done:
        create_tables()
        first_request_done = True

if __name__ == '__main__':
    app.run(debug=True)