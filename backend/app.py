from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "¡Hola desde el backend de Ambaria!"

if __name__ == '__main__':
    app.run(debug=True)
