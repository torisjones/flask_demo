from flask import Flask
app = Flask(__name__)

# Add Hello World GET route
# return String "Hello World!" and a 200 code from the / path


if __name__ == "__main__":
    app.run()
