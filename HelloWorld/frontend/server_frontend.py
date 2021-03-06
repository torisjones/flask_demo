from flask import Flask
from flask import send_from_directory
import os
app = Flask(__name__)


@app.route('/', methods=["GET"])
def serve_home_page():
    return send_from_directory(app.config['STATIC_CONTENT_DIRECTORY'], "index.html")


if __name__ == "__main__":
    app.config['STATIC_CONTENT_DIRECTORY'] = os.path.dirname(os.path.abspath(__file__)) + "/static"
    app.run()