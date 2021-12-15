from models import *
from config import *
from auth import *



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
            'scheduledTime': str(reminder.scheduledTime),
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
            {'message': 'Reminder fields are required.'}
        )        
    
    try:
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
    except Exception as error:
        return make_response(jsonify({'message': "Please schedule the reminder"}), 404)
    
    return make_response(jsonify({'message': "Reminder added successfully"}), 200)

@app.route('/reminders/<id>/', methods=['DELETE'])
@token_required
def delete_reminder(current_user, id):
	reminder = Reminder.query.filter_by(id=id).first_or_404()
	db.session.delete(reminder)
	db.session.commit()
	return make_response(jsonify({'message': "Deleted successfully"}), 200)

@app.route('/autoEventId/', methods=['GET'])
def auto_generated_id():
     id = Reminder.query.with_entities(func.max(Reminder.id)).all()[0][0]
     if id == None:
        id = 1
     else:
        id = id + 1
     eventId = "ER" + str(id)
     return{"eventid":eventId}