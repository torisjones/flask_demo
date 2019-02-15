from flask import Flask, request, jsonify, abort
import uuid
import hashlib
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

    def __init__(self, type, account_number, customer_id=None, nickname=None, rewards=0, balance=0):
        self.type = type
        self.account_number = account_number
        self.customer_id = customer_id
        self.nickname = nickname
        self.rewards = rewards
        self.balance = balance
        self._id = hashlib.md5(str(uuid.uuid4()).encode()).digest().hex()

    def get_id(self):
        return self._id


@app.route("/customer", methods=["GET"])
def get_customer():
    return jsonify([cust.to_json() for i, cust in CUSTOMERS.items()])


@app.route("/customer/<id>", methods=["GET"])
def get_customer_by_id(id):
    if id not in CUSTOMERS:
        return jsonify({"code": 404, "message": "This id does not exist in customers"})
    return jsonify(CUSTOMERS[id].to_json())


@app.route("/customer/<id>", methods=["PUT"])
def put_customer_by_id(id):
    if id not in CUSTOMERS:
        abort(404)
    customer = CUSTOMERS[id]
    customer.update(new_values=request.json)
    return jsonify({"code": 202, "message": "Accepted customer update"})


@app.route("/customer", methods=["POST"])
def add_customer():
    new_customer = Customer(**request.json)
    CUSTOMERS[new_customer.get_id()] = new_customer
    return jsonify({"code": 201, "message": "Customer created", "objectCreated": new_customer.to_json()})


@app.route("/customers/<id>/accounts", methods=["GET"])
def get_accounts_by_customer(id):
    if id not in CUSTOMERS:
        abort(400)
    return jsonify([ACCOUNTS[account_id].to_json() for account_id in CUSTOMERS[id].accounts])


@app.route("/customers/<id>/account", methods=["POST"])
def add_account(id):
    new_account = Account(**request.json)
    if id not in CUSTOMERS:
        abort(400)
    new_account.customer_id = id
    ACCOUNTS[new_account.get_id()] = new_account
    CUSTOMERS[new_account.customer_id].add_account(new_account.get_id())

    return jsonify({"code": 201, "message": "Account created", "objectCreated": new_account.to_json()})




if __name__ == "__main__":
    app.run()
