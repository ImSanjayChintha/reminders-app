import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

// array in local storage for registered users
const usersKey = 'userslist';
const currentUserKey = 'user';
const remindersKey = 'remindersList';
let users = JSON.parse(localStorage.getItem(usersKey)) || [];
let reminders = JSON.parse(localStorage.getItem(remindersKey)) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;
        let loggedInUser:any = JSON.parse(localStorage.getItem(currentUserKey)) || [];;
        return handleRoute();

        function handleRoute() {
            switch (true) {
                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/users/register') && method === 'POST':
                    return register();
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                case url.match(/\/users\/\d+$/) && method === 'GET':
                    return getUserById();
                case url.match(/\/users\/\d+$/) && method === 'PUT':
                    return updateUser();
                case url.match(/\/users\/\d+$/) && method === 'DELETE':
                    return deleteUser();
                case url.endsWith('/reminders/add') && method === 'POST':
                    return addReminder();
                case url.endsWith('/reminders') && method === 'GET':
                        return getReminders();
                case url.match(/\/reminders\/\d+$/) && method === 'DELETE':
                    return deleteReminder();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }    
        }

        // route functions

        function authenticate() {
            const { username, password } = body;
            const user = users.find(x => x.username === username && x.password === password);
            if (!user) return error('Username or password is incorrect');
          
            return ok({
                ...basicDetails(user),
                token: 'fake-jwt-token'
            })
        }

        function register() {   
                     
            const user = body

            if (users.find(x => x.username === user.username)) {
                return error('Username "' + user.username + '" is already taken')
            }

            user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
            const loggedUser = loggedInUser;
            user.createdBy = loggedUser && loggedUser.length != 0 ? loggedUser.id : user.id ;
            users.push(user);
            localStorage.setItem(usersKey, JSON.stringify(users));
            return ok();
        }

        function addReminder(){
            if (!isLoggedIn()) return unauthorized(); 

            const reminder = body
            if (reminders.find(x => x.eventId === reminder.eventId)) {
                return error('Event Id "' + reminder.eventId + '" is already taken')
            }

            reminder.id = reminders.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
            const loggedUser = loggedInUser;
            reminder.createdBy = loggedUser && loggedUser.length != 0 ? loggedUser.id : reminder.id ;
            reminders.push(reminder);
            localStorage.setItem(remindersKey, JSON.stringify(reminders));
            return ok();
        }

        function getUsers() {
            if (!isLoggedIn()) return unauthorized();            
            const createdBy = loggedInUser.id;
            let currentUsers = JSON.parse(localStorage.getItem(usersKey)) || [];;
            let userList = [currentUsers.filter(x => x.createdBy == createdBy)];
            userList = userList.length > 0 ? userList[0] : userList;
            return ok(userList.map(x => basicDetails(x)));
        }

        function getUserById() {
            if (!isLoggedIn()) return unauthorized();

            const user = users.find(x => x.id === idFromUrl());
           
            return ok(basicDetails(user));
        }

        function getReminders(){
            if (!isLoggedIn()) return unauthorized();  
            const createdBy = loggedInUser.id;
            let currentReminders = JSON.parse(localStorage.getItem(remindersKey)) || [];;
            let remindersList = [currentReminders.filter(x => x.createdBy == createdBy)];
            remindersList = remindersList.length > 0 ? remindersList[0] : remindersList;
            return ok(remindersList.map(x => reminderDetails(x)));
        }

        function updateUser() {
            if (!isLoggedIn()) return unauthorized();

            let params = body;
            let user = users.find(x => x.id === idFromUrl());

            // only update password if entered
            if (!params.password) {
                delete params.password;
            }

            // update and save user
            Object.assign(user, params);
            localStorage.setItem(usersKey, JSON.stringify(users));

            return ok();
        }
        function deleteReminder() {
            if (!isLoggedIn()) return unauthorized();

            reminders = reminders.filter(x => x.id !== idFromUrl());
            localStorage.setItem(remindersKey, JSON.stringify(reminders));
            return ok();
        }

        function deleteUser() {
            if (!isLoggedIn()) return unauthorized();

            users = users.filter(x => x.id !== idFromUrl());
            localStorage.setItem(usersKey, JSON.stringify(users));
            return ok();
        }

        // helper functions

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
                .pipe(delay(500)); // delay observable to simulate server api call
        }

        function error(message) {
            return throwError({ error: { message } })
                .pipe(materialize(), delay(500), dematerialize()); // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648);
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorized' } })
                .pipe(materialize(), delay(500), dematerialize());
        }

        function basicDetails(user) {
            const { id, username, firstName, lastName, createdBy } = user;
            return { id, username, firstName, lastName, createdBy };
        }

        function reminderDetails(reminder){
          const { id, eventId, header, text, scheduledTime, createdBy } = reminder;
            return { id, eventId, header,  text, scheduledTime, createdBy };
        }

        function isLoggedIn() {
            return headers.get('Authorization') === 'Bearer fake-jwt-token';
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }
    }
}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};