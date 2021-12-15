import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ThemePalette } from '@angular/material/core';
import { ReminderService, AlertService, AccountService } from '@app/_services';
import * as moment from 'moment';
@Component({
    templateUrl: './add-edit.component.html',
    styleUrls: ['./add-edit.component.scss']
})

export class AddEditComponent implements OnInit {
    form: FormGroup;
    id: string;
    revision :string;
    isAddMode: boolean;
    loading = false;
    submitted = false;
    currentUser: any = {};
    eventId :string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private reminderService: ReminderService,
        private alertService: AlertService,
        private accountService: AccountService
    ) { }

    ngOnInit() {
        //parameters of revision and event id
        this.id = this.route.snapshot.params['id'];
        this.revision = this.route.snapshot.params['revision']
        this.isAddMode = !this.id;       

      
        this.currentUser = this.accountService.userValue;


        this.form = this.formBuilder.group({
            eventid: ['', Validators.required],
            eventname: ['', Validators.required],
            eventdescription: ['', Validators.required],
            is_completed: [false],
            scheduledTime: ['', Validators.required],
            revision : [this.revision],
            createdBy: [this.currentUser.id],
        });

        if (!this.isAddMode) {
            this.reminderService.getReminderById(this.id,this.revision)
                .pipe(first())
                .subscribe(x => this.form.patchValue(x));
        }
        else{
            this.reminderService.getAutoEventId().pipe(first()).subscribe(data => {
                // Read the result field from the JSON response.
                this.eventId = data["eventid"];
                console.log(data["eventid"]);
              })
             
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
                    this.alertService.success('Reminders list refreshed successfully', { keepAfterRouteChange: true });
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