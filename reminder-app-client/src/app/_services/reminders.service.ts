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
        this.reminderSubject = new BehaviorSubject<Reminder>(JSON.parse(localStorage.getItem('user')));        
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

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/users/${id}`)
            .pipe(map(x => {                
                return x;
            }));
    }
}