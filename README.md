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
of the data of the incoming request object. Python has a feature called 

```python
def add_customer():
    new_customer = Customer(**request.json)
    new_customer.validate()
    CUSTOMERS[new_customer.get_id()] = new_customer
    return jsonify({"code": 201, "message": "Customer created", "objectCreated": new_customer.to_json()})
```

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


### Basic Front End
A basic front end is also included with this example that hits the endpoints defined in the banking tutorial. 

To run the front end, you will need to install npm. To install npm go to (https://www.npmjs.com/get-npm) and follow the instructions.

1. Navigate to /BasicFront
2. Run `npm install`
3. Run `npm run start`
4. Project should open a new window for you, if it does not, open a tab and go to `http://localhost:8050/`

