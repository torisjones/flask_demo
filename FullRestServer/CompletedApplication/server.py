from flask import Flask, request, jsonify
import uuid
import hashlib
from copy import copy
from random import randint
app = Flask(__name__)

# Databases

# Customer database. Key is the customer ID, Value is Customer object
CUSTOMERS = dict()

# Accounts Database. Key is the account ID, value is the Account Object
ACCOUNTS = dict()


class DataFormatMisMatch(ValueError):
    status_code = 400

    def __init__(self, message, status_code=None):
        """
        Helper Exception for returning proper error code to response.
        :param message: error message
        :param status_code: HTTP status code
        """
        ValueError.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code

    def to_dict(self):
        rv = dict()
        rv['message'] = self.message
        rv['code'] = 400
        return rv


class JsonRequest(object):
    """
    Base class for incoming request
    """
    MODEL = dict()

    def from_json(self, input_json, model=None):
        if model is None:
            model = self.MODEL
        for key, value in model.items():
            if type(value) == dict:
                self.from_json(input_json, model=model[key])
            else:
                self.__dict__[key] = input_json[key]

    def to_json(self, model=None):
        """
        Generates a dictionary according to the MODEL schema with class values
        :param model: Dictionary model for data
        :return: Dictionary
        """
        if model is None:
            model = self.MODEL
        json_dict = dict()
        for key, value in model.items():
            if type(value) == dict:
                json_dict[key] = self.to_json(model[key])
            elif type(self.__dict__[key]) != value:
                raise DataFormatMisMatch("Key {key} requires type {type} but type {actual} was found!".format(key=key,
                                                                                                      type=value,
                                                                                                      actual=type(self.__dict__[key])))
            else:
                json_dict[key] = self.__dict__[key]
        return json_dict

    def validate(self, model=None):
        """
        Validates Schema of request to ensure proper schema. Defined by Model
        :param model: Dictionary model for data
        :return:
        """
        if model is None:
            model = self.MODEL
        for key, value in model.items():
            if type(value) == dict:
                self.validate(model[key])
            elif type(self.__dict__[key]) != value:
                raise DataFormatMisMatch("Key {key} requires type {type} but type {actual} was found!".format(key=key,
                                                                                                      type=value,
                                                                                                      actual=type(self.__dict__[key])))
            else:
                # Passes Validation
                pass
        return

    def update(self, new_values, model=None):
        """
        Updates value of this class with input dictionary
        :param new_values: Dictionary of values to be updated
        :param model: Dictionary model for data
        :return:
        """
        if model is None:
            model = self.MODEL
        for key, value in new_values.items():
            if model.get(key) is None:
                raise DataFormatMisMatch("Key {key} not found in model!".format(key=key))
            if type(value) == dict:
                self.update(value, model[key])
            else:
                self.__dict__[key] = value


class Customer(JsonRequest):
    """
    Customer Data Class
    """
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

    def __init__(self, first_name=None, last_name=None, address=None):
        if address is None:
            address = dict()
        self._id = hashlib.md5(str(uuid.uuid4()).encode()).digest().hex()
        self.first_name = first_name
        self.last_name = last_name
        self.street_number = address.get('street_number')
        self.street_name = address.get('street_name')
        self.city = address.get('city')
        self.state = address.get('state')
        self.zip = address.get('zip')

        # For database lookup
        self.accounts = []

    def add_account(self, id):
        self.accounts.append(id)

    def remove_account(self, id):
        self.accounts.remove(id)

    def get_id(self):
        return self._id


class Account(JsonRequest):
    """
    Account Data Class
    """
    MODEL = {
        "_id": str,
        "type": str,
        "nickname": str,
        "rewards": int,
        "balance": int,
        "account_number": str,
        "customer_id": str
    }

    def __init__(self, type=None, account_number=None, customer_id=None, nickname=None, rewards=0, balance=0):
        self.type = type
        self.account_number = ''.join(["{0}".format(randint(0, 9)) for num in range(0, 16)]) if account_number is None else account_number
        self.customer_id = customer_id
        self.nickname = nickname
        self.rewards = rewards
        self.balance = balance
        self._id = hashlib.md5(str(uuid.uuid4()).encode()).digest().hex()

    def get_id(self):
        return self._id


@app.errorhandler(DataFormatMisMatch)
def handle_invalid_usage(error):
    """
    Error Handler for DataFormatMisMatch error. Returns a 400 code to requester from any thrown DataFormatMisMatch Exception
    :param error: DataFormatMisMatch Exception
    :return:
    """
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


# Route 1: POST Customer to the /customers endpoint
@app.route("/customers", methods=["POST"])
def add_customer():
    new_customer = Customer(**request.json)
    new_customer.validate()
    CUSTOMERS[new_customer.get_id()] = new_customer
    return jsonify({"code": 201, "message": "Customer created", "objectCreated": new_customer.to_json()}), 201


# Route 2: GET all Customers from the /customers endpoint
@app.route("/customers", methods=["GET"])
def get_customers():
    return jsonify([cust.to_json() for cust in CUSTOMERS.values()])


# Route 3: GET Customer by customer ID from the /customers/<id> endpoint
@app.route("/customers/<customer_id>", methods=["GET"])
def get_customer_by_id(customer_id):
    if customer_id not in CUSTOMERS:
        return jsonify({"code": 404, "message": "This id does not exist in customers"}), 404
    return jsonify(CUSTOMERS[customer_id].to_json())


# Route 4: PUT Customer by customer ID from the /customers/<id> endpoint
@app.route("/customers/<customer_id>", methods=["PUT"])
def put_customer_by_id(customer_id):
    if customer_id not in CUSTOMERS:
        return jsonify({"code": 404, "message": "This id does not exist in customers"}), 404
    customer = copy(CUSTOMERS[customer_id])
    customer.update(new_values=request.json)
    customer.validate()
    CUSTOMERS[customer_id] = customer
    return jsonify({"code": 202, "message": "Accepted customer update"}), 202


# Route 5: GET Accounts belonging to customer from the /customers/<customer_id>/accounts endpoint
@app.route("/customers/<customer_id>/accounts", methods=["GET"])
def get_accounts_by_customer(customer_id):
    if customer_id not in CUSTOMERS:
        return jsonify({"code": 404, "message": "This id does not exist in customers"}), 404
    return jsonify([ACCOUNTS[account_id].to_json() for account_id in CUSTOMERS[customer_id].accounts])


# Route 6: POST Account belonging to customer to the /customers/<customer_id>/accounts endpoint
@app.route("/customers/<customer_id>/accounts", methods=["POST"])
def add_account(customer_id):
    if customer_id not in CUSTOMERS:
        return (jsonify({"code": 404, "message": "Customer does not exist"}), 404)

    new_account = Account(**request.json)
    new_account.customer_id = customer_id
    new_account.validate()
    ACCOUNTS[new_account.get_id()] = new_account
    CUSTOMERS[new_account.customer_id].add_account(new_account.get_id())

    return jsonify({"code": 201, "message": "Account created", "objectCreated": new_account.to_json()}), 201


# Route 7: PUT Account by account id to the /accounts/<account_id> endpoint
@app.route("/accounts/<account_id>", methods=["PUT"])
def put_account(account_id):
    if account_id not in ACCOUNTS:
        return jsonify({"code": 404, "message": "This id does not exist in accounts"}), 404

    account = copy(ACCOUNTS[account_id])
    account.update(new_values=request.json)
    account.validate()
    ACCOUNTS[account_id] = account
    return jsonify({"code": 202, "message": "Accepted account update"}), 202


# Route 8: DELETE Account by account id to the /accounts/<account_id> endpoint
@app.route("/accounts/<account_id>", methods=["DELETE"])
def remove_account(account_id):
    if account_id not in ACCOUNTS:
        return jsonify({"code": 404, "message": "This id does not exist in accounts"}), 404
    customer_id = ACCOUNTS[account_id].customer_id
    CUSTOMERS[customer_id].remove_account(account_id)
    del ACCOUNTS[account_id]
    return ('', 204)


if __name__ == "__main__":
    app.run()
