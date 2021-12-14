import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { ReminderService, AlertService, AccountService } from '@app/_services';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    isAddMode: boolean;
    loading = false;
    submitted = false;
    currentUser : any = {};

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private reminderService: ReminderService,
        private alertService: AlertService,
        private accountService : AccountService
    ) {}

    ngOnInit() {
        
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;
        
        // password not required in edit mode
        const passwordValidators = [Validators.minLength(6)];
        if (this.isAddMode) {
            passwordValidators.push(Validators.required);
        }

        this.currentUser = this.accountService.userValue;


        this.form = this.formBuilder.group({
            eventid: ['', Validators.required],
            eventname: ['', Validators.required],
            eventdescription: ['', Validators.required],
            is_completed : [false],
            scheduledTime: ['',],
            createdBy : [this.currentUser.id],
        });

        if (!this.isAddMode) {
            this.reminderService.getReminderById(this.id)
                .pipe(first())
                .subscribe(x => this.form.patchValue(x));
        }
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.isAddMode) {
            this.createReminder();
        } else {
            this.updateReminder();
        }
    }

    private createReminder() {
        this.reminderService.addReminder(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Reminder added successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private updateReminder() {
        this.reminderService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
}