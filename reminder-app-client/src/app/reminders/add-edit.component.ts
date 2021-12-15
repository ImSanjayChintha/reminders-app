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
    @ViewChild('picker') picker: any;

    public scheduledTime: string ="";
    public date: moment.Moment;
    public disabled = false;
    public showSpinners = true;
    public showSeconds = false;
    public touchUi = false;
    public enableMeridian = false;
    public minDate: moment.Moment;
    public maxDate: moment.Moment;
    public stepHour = 1;
    public stepMinute = 1;
    public stepSecond = 1;
    public color: ThemePalette = 'accent';

    public dateControl = new FormControl(new Date(2021, 9, 4, 5, 6, 7));
    public stepHours = [1, 2, 3, 4, 5];
    public stepMinutes = [1, 5, 10, 15, 20, 25];
    public stepSeconds = [1, 5, 10, 15, 20, 25];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private reminderService: ReminderService,
        private alertService: AlertService,
        private accountService: AccountService
    ) { }

    ngOnInit() {
        
        this.id = this.route.snapshot.params['id'];
        this.revision = this.route.snapshot.params['revision']
        this.isAddMode = !this.id;
        this.date = moment(new Date(2021, 9, 4, 5, 6, 7));

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

    toggleMinDate(evt: any) {
        if (evt.checked) {
            this._setMinDate();
        } else {
            this.minDate = null;
        }
    }

    toggleMaxDate(evt: any) {
        if (evt.checked) {
            this._setMaxDate();
        } else {
            this.maxDate = null;
        }
    }

    private _setMinDate() {
        const now = new Date();
        this.minDate = moment(now);
        //this.minDate.setDate(now.getDate() - 1);
    }


    private _setMaxDate() {
        const now = new Date();
        this.maxDate = moment(now).add(1, 'd');
        //this.maxDate.setDate(now.getDate() + 1);
    }

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