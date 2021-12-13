import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {environment} from '@environments/environment';
import { Reminder, User } from '@app/_models';


@Injectable({ providedIn: 'root' })
export class ReminderService {   
    public reminder: Observable<Reminder>;
    private reminderSubject: BehaviorSubject<Reminder>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.reminderSubject = new BehaviorSubject<Reminder>(JSON.parse(localStorage.getItem('remindersList')));        
        this.reminder = this.reminderSubject.asObservable();
    }

    public get reminderValue(): Reminder {
        return this.reminderSubject.value;
    }

    addReminder(reminder:Reminder){
        return this.http.post(`${environment.apiUrl}/reminders/add`, reminder);
    }

    getAllReminders() {
        return this.http.get<User[]>(`${environment.apiUrl}/reminders`);
    }

    getReminderById(id: string) {
        return this.http.get<User>(`${environment.apiUrl}/reminders/${id}`);
    }

    update(id, params) {
        return this.http.put(`${environment.apiUrl}/reminders/${id}`, params)
            .pipe(map(x => {
                // update stored user if the logged in user updated their own record
                if (id == this.reminderValue.id) {
                    // update local storage
                    const reminder = { ...this.reminderValue, ...params };
                    localStorage.setItem('remindersList', JSON.stringify(reminder));
                    
                    // publish updated user to subscribers
                    this.reminderSubject.next(reminder);
                }
                return x;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/reminders/${id}`)
            .pipe(map(x => {                
                return x;
            }));
    }
}