from flask import Flask, jsonify, request, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import func
import os
import uuid
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
from flask_cors import CORS


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


# Product Class/Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    firstname = db.Column(db.String(50), nullable=False)
    lastname = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(50), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    createdBy = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return '<User {}>'.format(self.username)


class Reminder(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    eventid = db.Column(db.String(50), nullable=False)
    eventname = db.Column(db.String(50), nullable=False)
    eventdescription = db.Column(db.String(50), nullable=False)
    scheduledTime = db.Column(db.DateTime(50), nullable=True)
    is_completed = db.Column(db.Boolean, default=False)
    revision = db.Column(db.Integer, default=False, autoincrement=True)
    createdBy = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return '<Reminder {}>'.format(self.id)


db.create_all()


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # jwt is passed in the request header
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        # return 401 if token is not passed
        if not token:
            return jsonify({'message': 'Token is missing !!'}), 401

        try:
            # decoding the payload to fetch the stored details
            data = jwt.decode(
                token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query\
                .filter_by(username=data['username'])\
                .first()
        except:
            return jsonify({
                'message': 'Token is invalid !!'
            }), 401
        # returns the current logged in users contex to the routes
        return f(current_user, *args, **kwargs)

    return decorated


@app.route('/')
def home():
	return {
		'message': 'Welcome to Reminders App'
	}


@app.route('/users/')
@token_required
def get_users(current_user):
	return make_response(jsonify([
		{
                    'id': user.id,
                 			'username': user.username, 'firstname': user.firstname, 'lastname': user.lastname,
                 			'is_admin': user.is_admin,
                    'requestby': current_user.createdBy
                } for user in User.query.filter_by(createdBy=current_user.createdBy).all()
	]))


@app.route('/users/', methods=['POST'])
def create_user():
	data = request.get_json()
	if not 'username' in data or not 'password' in data:
		return make_response(jsonify({
			'error': 'Bad Request',
			'message': 'username or password not given'
		}), 400)
	if len(data['username']) < 4 or len(data['lastname']) < 1:
		return make_response(jsonify({
			'error': 'Bad Request',
			'message': 'username must be contain minimum of 4 letters and lastname atleast one letter'
		}), 400)

	u = User(
            username=data['username'],
            firstname=data['firstname'],
            lastname=data['lastname'],
            password=generate_password_hash(data['password']),
         			is_admin=data.get('is_admin', False),
            createdBy=data['createdBy']
        )
	db.session.add(u)
	db.session.commit()
	return make_response(jsonify({
		'username': u.username, 'firstname': u.firstname,
		'lastname': u.lastname, 'is_admin': u.is_admin
	}), 201)


@app.route('/users/<id>/')
@token_required
def get_user(current_user, id):

	user = User.query.filter_by(id=id).filter_by(createdBy=current_user.createdBy).first_or_404()
	return make_response(jsonify({
            'id': user.id,
          		'username': user.username, 'firstname': user.firstname,
          		'lastname': user.lastname, 'is_admin': user.is_admin
        }), 200)


@app.route('/login', methods=['POST'])
def login():
    # creates dictionary of form data
    auth = request.get_json()

    if not auth or not auth.get('username') or not auth.get('password'):
        # returns 401 if any email or / and password is missing
        return make_response(
            'Could not verify',
            401,
            {'WWW-Authenticate': 'Basic realm ="Login required !!"'}
        )

    user = User.query\
        .filter_by(username=auth.get('username'))\
        .first()

    if not user:
        # returns 401 if user does not exist
        return make_response(
            'Could not verify',
            401,
            {'WWW-Authenticate': 'Basic realm ="User does not exist !!"'}
        )

    if check_password_hash(user.password, auth.get('password')):
        # generates the JWT Token
        token = jwt.encode({
            'username': user.username,
            'exp': datetime.utcnow() + timedelta(minutes=30)
        }, app.config['SECRET_KEY'])

        return jsonify({'token': token, 'username': user.username, 'firstname': user.firstname,
                        'lastname': user.lastname, 'is_admin': user.is_admin, 'createdBy': user.createdBy, 'id': user.id})
    # returns 403 if password is wrong
    return make_response(
        'Could not verify',
        403,
        {'WWW-Authenticate': 'Basic realm ="Wrong Password !!"'}
    )


@app.route('/users/<id>/', methods=['PUT'])
@token_required
def update_user(current_user, id):
    data = request.get_json()
    if 'firstname' not in data or 'lastname' not in data or 'username' not in data:
        return make_response(
            'Could not proccess',
            403,
            {'message': 'All fields are required. !!'}
        )

    user = User.query.filter_by(id=id).first_or_404()
    user.firstname = data["firstname"]
    user.lastname = data["lastname"]
    user.username = data["username"]
    if "is_admin" in data:
        user.is_admin = data["is_admin"]
    db.session.commit()
    return make_response(jsonify({'message': "Updated successfully"}), 200)


@app.route('/users/<id>/', methods=['DELETE'])
@token_required
def delete_user(current_user, id):
	user = User.query.filter_by(id=id).first_or_404()
	db.session.delete(user)
	db.session.commit()
	return make_response(jsonify({'message': "Deleted successfully"}), 200)


@app.route('/reminders/', methods=['POST'])
@token_required
def createReminder(current_user):
    data = request.get_json()

    if not data or not data.get('createdBy'):
        return make_response(jsonify({
            'error': 'Bad Request',
         			'message': 'server error'
        }), 404)

    if not data or not data.get('eventid') or not data.get('eventname'):
        return make_response(jsonify({
            'error': 'Bad Request',
         			'message': 'Event Details required'
        }), 404)    

    r = Reminder(
        eventid = data["eventid"],
        eventname = data["eventname"],
        eventdescription = data["eventdescription"],
        scheduledTime = datetime.strptime(str(data["scheduledTime"]),"%Y-%m-%dT%H:%M"),
        is_completed = data["is_completed"],
        revision = 0,
        createdBy = current_user.id
    )
    db.session.add(r)
    db.session.commit()
    return make_response(jsonify({"message" : "Added Successfully"}), 201)


@app.route('/reminders/', methods=['GET'])
@token_required
def get_reminders(current_user):
	return make_response(jsonify([
		{
            'id': reminder.id,
            'eventid': reminder.eventid, 'eventname': reminder.eventname, 'eventdescription': reminder.eventdescription,
            'revision' : reminder.revision,
            'scheduledTime': reminder.scheduledTime,
            'is_completed': reminder.is_completed, 'createdBy': current_user.id
        } for reminder in Reminder.query.filter_by(createdBy=current_user.id).all()
	]))

@app.route('/reminders/<id>/<revision>', methods=['GET'])
@token_required
def get_reminder(current_user, id,revision):
    #revision = int(request.form.get('revision')) if request.form.get('revision') != None else 0
    revisionid = int(revision)
    reminder = Reminder.query.filter_by(eventid=id).filter_by(createdBy=current_user.id).filter_by(revision=revisionid).first_or_404()
    return make_response(jsonify({
             'id': reminder.id,
             'revision' : reminder.revision,
            'eventid': reminder.eventid, 'eventname': reminder.eventname, 'eventdescription': reminder.eventdescription,
            'scheduledTime': reminder.scheduledTime,
            'is_completed': reminder.is_completed, 'createdBy': current_user.id
        }), 200)

@app.route('/reminders/<id>/', methods=['PUT'])
@token_required
def update_reminder(current_user, id):
    data = request.get_json()
    if 'eventid' not in data or 'eventname' not in data:
        return make_response(
            'Could not proccess',
            403,
            {'message': 'Basic realm ="Event fields are required. !!"'}
        )
    #queryId = int(id)  

    revision = Reminder.query.with_entities(func.max(Reminder.revision)).all()[0][0]

    r = Reminder(
        eventid = data["eventid"],
        eventname = data["eventname"],
        eventdescription = data["eventdescription"],
        scheduledTime = datetime.strptime(str(data["scheduledTime"]),"%Y-%m-%dT%H:%M"),
        is_completed = data["is_completed"],        
        createdBy = current_user.id,
        revision = revision + 1
    )  
    db.session.add(r)
    db.session.commit()
    return make_response(jsonify({'message': "Updated successfully"}), 200)

@app.route('/reminders/<id>/', methods=['DELETE'])
@token_required
def delete_reminder(current_user, id):
	reminder = Reminder.query.filter_by(id=id).first_or_404()
	db.session.delete(reminder)
	db.session.commit()
	return make_response(jsonify({'message': "Deleted successfully"}), 200)


if __name__ == '__main__':
	app.run()
