# reminders-app

# reminders-app-client

I have built this app using Angular 10 version.

I have added two screens
- Users : To Add users to visit the screen.
- Reminders : To Add and Delete the reminders.

•	Its Store reminders text, reminder time and a title

•	Store reminders at any URL and it will automatically creates event Id

•	Does NOT allow interaction by non-authenticated users

•	Does NOT allow a user to access reminders submitted by another user

•	Allows users to store multiple revisions of the same reminder at the same URL (edit/ReminderId/RevisionId)

•	Allows users to fetch any revision of any reminder (edit/ReminderId/RevisionId)

To Run the app:

Machine Git Directory>/npm install

Machine Git Directory>/npm start

To use Backend API, Please change the url in enviornments directory

In enviornment.ts and enviornment.prod.ts

apiUrl: http://backend-url/


# reminders-app-backend

I have developed this app using python 3.9 and SQLite database.

For authentication, I have used to token based authentication. If you register and login back, it will gives token.

auth.py - handles authentication

config.py - imports necessary packages and mantains secret key

models.py - create tables and ORM schems for SQLite database

users.py - manages CRUD on users table

reminders.py - reminders CRUD on reminders table

app.py - entry point of the api

SQLite - Light weight database.


To run the app , please following steps:

Git directory> python -m install vnev .venv

Git directory> python -m install --upgrade pip

Git directory> python -m install -r requirements.txt

Git directory> python app.py

Please copy the host the url and paste it in client app. 
