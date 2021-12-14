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
    private userSubject: BehaviorSubject<User>;
    public user: Observable<User>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.reminderSubject = new BehaviorSubject<Reminder>(JSON.parse(localStorage.getItem('remindersList')));        
        this.reminder = this.reminderSubject.asObservable();
    }

    public get userValue(): User {
        return this.userSubject.value;
    }

    public get reminderValue(): Reminder {
        return this.reminderSubject.value;
    }

    addReminder(reminder:Reminder){
        return this.http.post(`${environment.apiUrl}/reminders/`, reminder);
    }

    getAllReminders() {
        return this.http.get<Reminder[]>(`${environment.apiUrl}/reminders/`);
    }

    getReminderById(id: string, revision:string) {
        
        
        return this.http.get<Reminder>(`${environment.apiUrl}/reminders/${id}/${revision}`);
    }

    update(id, params) {
        return this.http.put(`${environment.apiUrl}/reminders/${id}/`, params)
            .pipe(map(x => {               
                return x;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/reminders/${id}/`)
            .pipe(map(x => {                
                return x;
            }));
    }
}