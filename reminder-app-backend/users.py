from models import *
from config import *
from auth import *


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



@app.route('/users/<id>/')
@token_required
def get_user(current_user, id):

	user = User.query.filter_by(id=id).filter_by(createdBy=current_user.createdBy).first_or_404()
	return make_response(jsonify({
            'id': user.id,
          		'username': user.username, 'firstname': user.firstname,
          		'lastname': user.lastname, 'is_admin': user.is_admin
        }), 200)




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
