from flask import Blueprint
account_urls = Blueprint('urls', __name__,)

ACCOUNTS = dict()
ACCOUNTS[1] = "This is a test Account"


@account_urls.route("/account/<int:id>", methods=["GET"])
def home(id):
    return ACCOUNTS[id]
