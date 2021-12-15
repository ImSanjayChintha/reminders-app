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

apiUrl: <API URL>
