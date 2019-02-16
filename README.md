# Introduction to Flask

Flask is a popular open source package for python that makes developing
web applications quick and simple. This tutorial is an introduction to the
framework and the development of RESTful web servers. We will be integrating
with Capital One's Nessie Api to serve our mock data. More information on 
Nessie can be found at http://api.reimaginebanking.com/


### Setup

#### Install Python (Mac)

Confirm your Python version by running the following command in terminal:

```python --version```

If it is version 3.6+, move on to 'Hello World Application'. If not, check to see if you have homebrew installed with:

```$ brew doctor``` 

```Your system is ready to brew.```

If you do not have homebrew installed, get it. It's a lifesaver. Homebrew depends on Apple’s Xcode package, so run the following command to install Xcode first:

```$ xcode-select --install```

Click through all the confirmation commands (Xcode is a large program so this might take a while to install depending on your internet connection).

Next, install Homebrew:

```/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"```

Once you have homebrew, run the following command to install the latest python version

```brew install python3```

#### Install Python (Windows)

Download python 3.7 at https://www.python.org/downloads/windows/

## Hello World Application

To get this project running, you will need to have installed python (preferably python 3.6+) and
a text editor. 

1. Change directory to the base directory of this project
2. Run `pip3 install -r requirements.txt` 


To test that this worked successfully, change directories to `HelloWorld/basic` then run `python3 server.py` 
and go to `http://localhost:5000`. You should see the text `Hello World!` displayed on your screen.

On linux/Mac os this looks like 
```bash
pip3 install -r requirements.txt
cd HelloWorld/basic/
python3 server.py
```


## Hello World Flask Example
The first tutorial of this workshop is a basic hello world flask application where it will walk you through creating 
your first flask application with a basic response. 

In the directory `HelloWorld/Workshop`, there is a file `server.py` that contains the boiler plate code for the HelloWorld application.
The boiler plate code imports flask, creates an application object with the name of the class (in this case it is server) and
adds a statement for starting the app if it is being run from the command line.  

*Note: A completed version of this file is located at `HelloWorld/basic/server.py`*


First, we need to write the function that will be serving the HTTP request. The function will take no input arguments and 
return the string `"Hello World"`. Below is a sample function

```python
def hello_world():
    return "Hello, World!"
```

Next, we will need to wrap this function with a decorator. Flask works by using decorators to wrap functions defined in the file to serve HTTP requests. 
To make a function able to respond to a request, we will wrap it in the `@flask.Flask.route` decorator. Since we have 
imported flask in the beginning of the file and defined `app=Flask(__name__)`, we can simply use `@app.route` (refer to
http://flask.pocoo.org/docs/1.0/api/ for more uses of the `route` decorator.)

The function now looks like
```python
@app.route
def hello_world():
    return "Hello, World!"
```

Finally, we need to add some arguments to the route decorator. To serve the request, we have to add the path and the method
used in the request. For the purpose of this hello world application, we will be using the root path `/` and the GET method to serve the `Hello World!` 
response from. 

```python
@app.route("/", methods=["GET"])
def hello_world():
    return "Hello, World!"
```

Now we need to run the flask server. Navigate to the directory where the file is located and run the command 
`python3 server.py` (you can also run it from any directory by running `python path/to/the/file/server.py`).

From here, the server should start running on your local host on port 5000. Verify that the server is functioning correctly
by navigating to `http://localhost:5000/` in a web browser of your choice. You should see `Hello World!` text displayed on 
your screen. 


## Customer Banking Flask Application
Now that you have flask running on your computer, let's dive into a more complex example. In this application, we will be 
making a backend for a commercial banking platform. This server needs to allow people to create Customers,
get all Customers in the system and modify existing customers. On top of this, each customer needs to be able to create Accounts,
get all Accounts under their ID, modify existing accounts and delete old accounts. 

In the directory `FullRestServer/Workshop`, there is a file `server.py` that contains the boiler plate code for the banking application.
The boiler plate code in this example is much more extensive:
    
* Imports Flask and other needed modules
* Initializes Flask application
* Data store (dictionary object) for Accounts and Customers (`ACCOUNTS`, `CUSTOMERS`)
* Base class for the data (`JsonRequest`)
* Data classes for both Accounts and Customers (`Account`, `Customer`)
* Custom Exception class (`DataFormatMisMatch`)
* Custom Exception handler method for returning 400 responses when data validation fails (Function `handle_invalid_usage`)

*Note: A completed version of this file is located at `FullRestServer/Workshop/server.py`*

#### Storing user created data
To make this tutorial simple, all data is stored in memory in two dictionary objects. When you stop and restart the application, all of the data 
previously created for customers and accounts will be purged from memory. If you wish to persist the data between executions of the server, you
will need to integrate an external database.

The key/value pair of the dictionaries is `internal_id`: `Object`. 

#### Creating the Customer Endpoints
First, let's create the endpoints needed for getting (GET), creating (POST) and modifying (PUT) customers. 

##### Route 1: Creating a Customer: POST
The purpose of this first route is to create entries in the customer database. To create an entry, we will need to generate
an internal customer ID, validate the incoming request json to ensure it contains all the data needed for the entry, and 
return a 201 status code saying that the entry has been added to the database. 

Let's start out by building the function. The first thing we will need to do is create a new Customer object with all 
of the data of the incoming request object. Python has a feature called `**kwargs` that allows us to pass a dictionary in 
as function arguments. To access the body (json -> dictionary) included in the request, flask has a method `request.json` 
that generates the dictionary object. This can then be passed into the Customer object with `Customer(**request.json)`. 

Next, we want to call the `validate()` function on the Customer class. This will compare the data loaded into the class with the predefined schema. 
If there is a mismatch between datatypes, it will throw a `DataFormatMisMatch` exception. This exception will be caught by the
exception handler function and then a 400 response will be sent to the client. 

Then we will need to add the customer to the database. In our case, we are using a dictionary with the key as the customer id 
and the value as the Customer object. 

Finally, we construct the response to the client following the model defined in the Nessie API standards. Use the jsonify method
to create the json response with the schema:
```json
{
  "code": 201,
  "message": "Customer created",
  "objectCreated": {
        "_id": "string",
        "address": {
            "city": "string",
            "state": "string",
            "street_name": "string",
            "street_number": "string",
            "zip": "string"
        },
        "first_name": "string",
        "last_name": "string"
    }
}
```


Putting it all together:
```python
@app.route("/customers", methods=["POST"])
def add_customer():
    new_customer = Customer(**request.json)         # Creates Customer object
    new_customer.validate()                         # Validates Data
    CUSTOMERS[new_customer.get_id()] = new_customer # Adds Customer object to database
    return jsonify({"code": 201, "message": "Customer created", "objectCreated": new_customer.to_json()}), 201 # Response returned to client
```
Add this function under the comment `Route 1.`



##### Route 2: Getting all Customers: GET 
The second method that we will create is to get all customers in the CUSTOMERS database from the `/customers` route. The method will need to a return
 a list of `Customer` objects. Luckily, python makes it easy to list all objects from a dictionary with the `.values()` method. 
 
We will need to iterate through this list of values and convert the customer objects to dictionaries. Once they data objects are
in the dictionary format, flask can easily convert this into a json response. We will also need to wrap this function in a decorator
with the appropriate route and method type. To convert the list of dictionaries into a json, we can use flask's jsonify function.

Using python's built in list comprehension, we can make this task into a one line function:
```python
@app.route("/customers", methods=["GET"])
def get_customers():
    return jsonify([cust.to_json() for cust in CUSTOMERS.values()])
```
Add this function under the comment `Route 2.`
 
##### Route 3: Get Customers by customer ID: GET 
When we are retrieving customer information, it would be inefficient to get all customers every time we wanted to only access the 
information of one customer. To solve this problem, we will create a method that only gets the customer specified by the ID
passed in the request. 

In flask, we can define URL variables with the `<varName>` format and pass the variable name via the function's arguments. 
Example:
```python
@app.route("/home/<user>", methods=["GET"])
def get_user(user):
    return "You got user {user}".format(user=user)
```
Here, we have the variable user in the URL and have a function argument where the variable is passed. 

When using customer Ids, we will follow a similar format. The path of the request should contain `customers` at the root
then the customer id as the path variable (`/customers/<customer_id>`).

First, we need to confirm that the customer exists in the database. We can check that an entry exists with the `if <key> in <dict>`
syntax. For us, the line will look like `if customer_id not in CUSTOMERS` as we are seeing if the entry doesn't exist. 
If the customer id doesn't exist, then we will return a 404 error code. The schema of this json response is:
```json
{ 
  "code": 404, 
  "message": "This id does not exist in customers",
}
```
With flask, we can return the HTTP status as the second variable in an array. Python makes this easy by allowing us to use the 
`return var1, var2` syntax where the first var is the json string and the second is our http code as an integer.

If the customer exists in the database, then we can go ahead and return the json of the Customer object by calling the `.to_json()` method 
of the Customer object and converting it into a string. If no response code is contained the return, flask implicitly assumes a 200 code.

Putting it all together, the function looks like this:
```python

@app.route("/customers/<customer_id>", methods=["GET"])   # Contains Path variable
def get_customer_by_id(customer_id):                      # Path variable as argument
    if customer_id not in CUSTOMERS:                      # Check to see if id exists in database 
        return jsonify({"code": 404, "message": "This id does not exist in customers"}), 404    # Return 404 if not found
    return jsonify(CUSTOMERS[customer_id].to_json())      # Return the string form of the dictionary (json) object
```

Add this function under the comment `Route 3.`


##### Route 4: Modifying existing Customer: PUT
The last feature of the Customer API is allowing a client to modify an existing entry. Instead of deleting and recreating 
a customer every time data changes, we can modify the object in place. This method is a combination of both the get and create 
user functions.

Using the same path from route 4, we change the method to a `PUT`. 

The initial part of the function starts out the same as the GET endpoint, verifying that a customer is in the database before proceeding with 
modifying the object.

Once we have confirmed it exists, we want to modify the object. However, we do not want to modify the actual object before we
confirm that the data entered is valid. To achieve this, we will 
1. Clone the Customer object
2. Update the data 
3. Validate that the data is still valid and if it is, save it back to the same key in the database
4. Return a 202 code

Using the `copy()` function, we can create a copy of the Customer object. Then we will call the `.update(new_json)` method in the 
Customer object to update the relevant fields. The `.validate()` method will then validate that the Customer has valid data and finally, 
we will save it back to dictionary with the same Customer Id. 

Putting it all together, the function looks like this:
```python
@app.route("/customers/<customer_id>", methods=["PUT"])           # Contains Path variable
def put_customer_by_id(customer_id):                              # Path variable as argument
    if customer_id not in CUSTOMERS:                              # Check to see if id exists in database 
        return jsonify({"code": 404, "message": "This id does not exist in customers"}), 404   # Return 404 if not found
    customer = copy(CUSTOMERS[customer_id])                       # Generate a copy of the Customer Object
    customer.update(new_values=request.json)                      # Update the object
    customer.validate()                                           # Validate that is still valid
    CUSTOMERS[customer_id] = customer                             # Save it if it is Valid
    return jsonify({"code": 202, "message": "Accepted customer update"}), 202  # Return a 202
```

Add this function under the comment `Route 4.`



### Basic Front End
A basic front end is also included with this example that hits the endpoints defined in the banking tutorial. 

To run the front end, you will need to install npm. To install npm go to (https://www.npmjs.com/get-npm) and follow the instructions.

1. Navigate to /BasicFront
2. Run `npm install`
3. Run `npm run start`
4. Project should open a new window for you, if it does not, open a tab and go to `http://localhost:8050/`

