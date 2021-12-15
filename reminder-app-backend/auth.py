from functools import wraps
from flask import request, jsonify, make_response
from models import *
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

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