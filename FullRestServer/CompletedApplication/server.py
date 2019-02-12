from flask import Flask
app = Flask(__name__)

from account import account_urls
app.register_blueprint(account_urls)

if __name__ == "__main__":
    app.run()
