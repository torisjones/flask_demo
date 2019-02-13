# Introduction to Flask

Flask is a popular open source package for python that makes developing
web applications quick and simple. This tutorial is an introduction to the
framework and the development of RESTful web servers. 


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

## Basic Front End

## Account Management
