import { Component, OnInit, Inject, Optional  } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
export interface RemindersData {
    reminderHeader : string;
    reminderText: string;
    id: number;
  }
  
@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html'
})
export class AlertDialogComponent {
    action:string;
    local_data:any;
  
    constructor(
      public dialogRef: MatDialogRef<AlertDialogComponent>,
      //@Optional() is used to prevent error if no data is passed
      @Optional() @Inject(MAT_DIALOG_DATA) public data: RemindersData) {
      console.log(data);
      this.local_data = {...data};
      this.action = this.local_data.action;
    }
  
    doAction(){
      this.dialogRef.close({event:this.action,data:this.local_data});
    }
  
    closeDialog(){
      this.dialogRef.close({event:'Cancel'});
    }
  
}