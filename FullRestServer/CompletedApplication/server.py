from flask import Flask, request, jsonify, abort
import uuid
import hashlib
from random import randint
app = Flask(__name__)

CUSTOMERS = dict()
ACCOUNTS = dict()


class JsonRequest(object):
    MODEL = dict()

    def from_json(self, input_json, model=None):
        if model is None:
            model = self.MODEL
        for key, value in model.items():
            if type(value) == dict:
                self.from_json(input_json, model=model[key])
            else:
                self.__dict__[key] = input_json[key]

    def to_json(self):
        return self.__parse_model(self.MODEL)

    def __parse_model(self, model):
        json_dict = dict()
        for key, value in model.items():
            if type(value) == dict:
                json_dict[key] = self.__parse_model(model[key])
            elif type(self.__dict__[key]) != value:
                raise ValueError("Key {key} requires type {type} but type {actual} was found!".format(key=key,
                                                                                                      type=value,
                                                                                                      actual=type(self.__dict__[key])))
            else:
                json_dict[key] = self.__dict__[key]
        return json_dict

    def update(self, new_values, model=None):
        if model is None:
            model = self.MODEL
        for key, value in new_values.items():
            if model.get(key) is None:
                raise ValueError("Key {key} not found in model!".format(key=key))
            if type(value) == dict:
                self.update(value, model[key])
            else:
                self.__dict__[key] = value


class Customer(JsonRequest):
    MODEL = {
      "_id": str,
      "first_name": str,
      "last_name": str,
      "address": {
        "street_number": str,
        "street_name": str,
        "city": str,
        "state": str,
        "zip": str
        }
    }

    def __init__(self, first_name, last_name, address):
        self._id = hashlib.md5(str(uuid.uuid4()).encode()).digest().hex()
        self.first_name = first_name
        self.last_name = last_name
        self.street_number = address['street_number']
        self.street_name = address['street_name']
        self.city = address['city']
        self.state = address['state']
        self.zip = address['zip']

        # For database lookup
        self.accounts = []

    def add_account(self, id):
        self.accounts.append(id)

    def remove_account(self, id):
        self.accounts.remove(id)

    def get_id(self):
        return self._id


class Account(JsonRequest):
    MODEL = {
        "_id": str,
        "type": str,
        "nickname": str,
        "rewards": int,
        "balance": int,
        "account_number": str,
        "customer_id": str
    }

    def __init__(self, type, customer_id=None, nickname=None, rewards=0, balance=0):
        self.type = type
        self.account_number = ''.join(["{0}".format(randint(0, 9)) for num in range(0, 16)])
        self.customer_id = customer_id
        self.nickname = nickname
        self.rewards = rewards
        self.balance = balance
        self._id = hashlib.md5(str(uuid.uuid4()).encode()).digest().hex()

    def get_id(self):
        return self._id


@app.route("/customers", methods=["GET"])
def get_customer():
    return jsonify([cust.to_json() for i, cust in CUSTOMERS.items()])


@app.route("/customers/<id>", methods=["GET"])
def get_customer_by_id(id):
    if id not in CUSTOMERS:
        return jsonify({"code": 404, "message": "This id does not exist in customers"})
    return jsonify(CUSTOMERS[id].to_json())


@app.route("/customers/<id>", methods=["PUT"])
def put_customer_by_id(id):
    if id not in CUSTOMERS:
        return (jsonify({"code": 404, "message": "This id does not exist in customers"}), 400)
    customer = CUSTOMERS[id]
    customer.update(new_values=request.json)
    return jsonify({"code": 202, "message": "Accepted customer update"})


@app.route("/customers", methods=["POST"])
def add_customer():
    new_customer = Customer(**request.json)
    CUSTOMERS[new_customer.get_id()] = new_customer
    return jsonify({"code": 201, "message": "Customer created", "objectCreated": new_customer.to_json()})


@app.route("/customers/<customer_id>/accounts", methods=["GET"])
def get_accounts_by_customer(customer_id):
    if customer_id not in CUSTOMERS:
        return (jsonify({"code": 404, "message": "This id does not exist in customers"}), 400)
    return jsonify([ACCOUNTS[account_id].to_json() for account_id in CUSTOMERS[customer_id].accounts])


@app.route("/customers/<customer_id>/accounts", methods=["POST"])
def add_account(customer_id):
    if customer_id not in CUSTOMERS:
        return (jsonify({"code": 400, "message": "Customer does not exist"}), 400)

    new_account = Account(**request.json)
    new_account.customer_id = customer_id
    ACCOUNTS[new_account.get_id()] = new_account
    CUSTOMERS[new_account.customer_id].add_account(new_account.get_id())

    return jsonify({"code": 201, "message": "Account created", "objectCreated": new_account.to_json()})


@app.route("/customers/<account_id>/accounts", methods=["PUT"])
def put_account(account_id):
    if account_id not in ACCOUNTS:
        abort(400)

    account = ACCOUNTS[account_id]
    account.update(new_values=request.json)

    return jsonify({"code": 202, "message": "Accepted account update"})


@app.route("/customers/<account_id>/accounts", methods=["DELETE"])
def remove_account(account_id):
    if account_id not in ACCOUNTS:
        abort(400)
    customer_id = ACCOUNTS[account_id].customer_id
    CUSTOMERS[customer_id].remove_account(account_id)
    del ACCOUNTS[account_id]

    return ('', 204)


if __name__ == "__main__":
    app.run()
