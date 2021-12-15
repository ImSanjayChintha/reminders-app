
from config import *


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