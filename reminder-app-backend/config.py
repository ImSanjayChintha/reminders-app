from flask import Flask
import os
from flask_cors import CORS
from sqlalchemy import func
from flask_sqlalchemy import SQLAlchemy

#Init app
app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))

CORS(app)

# Database
app.config['SECRET_KEY'] = 'secret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + \
    os.path.join(basedir, 'db.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Init db
db = SQLAlchemy(app)