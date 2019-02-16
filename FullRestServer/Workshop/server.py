from flask import Flask, request, jsonify, send_from_directory
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

# Route 2: GET all Customers from the /customers endpoint

# Route 3: GET Customer by customer ID from the /customers/<id> endpoint

# Route 4: PUT Customer by customer ID from the /customers/<id> endpoint

# Route 5: GET Accounts belonging to customer from the /customers/<customer_id>/accounts endpoint

# Route 6: POST Account belonging to customer to the /customers/<customer_id>/accounts endpoint

# Route 7: PUT Account by account id to the /accounts/<account_id> endpoint

# Route 8: DELETE Account by account id to the /accounts/<account_id> endpoint

# Serves front end JS from python
@app.route('/', methods=["GET"])
def serve_home_page():
    return send_from_directory(app.config['STATIC_CONTENT_DIRECTORY'], "index.html")


if __name__ == "__main__":
    app.config['STATIC_CONTENT_DIRECTORY'] = os.path.dirname(os.path.abspath(__file__)) + "/static/"
    app.run()

