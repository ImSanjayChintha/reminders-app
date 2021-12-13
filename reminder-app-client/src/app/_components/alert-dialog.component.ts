import { Component, Inject  } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
export interface RemindersData {
    reminderHeader : string;
    reminderText: string;
    id: number;
  }
  
@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['alert-dialog.component.scss']
})
export class AlertDialogComponent {
    reminderHeader:string;
    reminderText:string;
    id:number;
  
    constructor(
      public dialogRef: MatDialogRef<AlertDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: RemindersData) {
        console.log(this.data)
       }
  
    onNoClick(): void {
      this.dialogRef.close();
    }  
  
  
}