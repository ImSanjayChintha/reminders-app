import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { ReminderService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    reminders = null;

    constructor(private reminderService: ReminderService) {}

    ngOnInit() {
        this.reminderService.getAllReminders()
            .pipe(first())
            .subscribe(reminders => this.reminders = reminders);
    }

    deleteReminder(id: string) {
        const user = this.reminders.find(x => x.id === id);
        user.isDeleting = true;
        this.reminderService.delete(id)
            .pipe(first())
            .subscribe(() => this.reminders = this.reminders.filter(x => x.id !== id));
    }
}