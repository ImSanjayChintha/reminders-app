import {Component} from '@angular/core';

export interface PeriodicElement {
  text: string;
  header : string;
  status : string,
  scheduledTime : string,
  id: number;
  actions : any;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {id: 1, header:'Morning Reminder',status:'in 30 mins',scheduledTime : 'Today 05:45', text: 'Hydrogen', actions : []},
  {id: 2, header:'Tea break',status:'in 10 mins',scheduledTime : 'Today 05:45', text: 'Remind me every 40 mins', actions : []},
  {id: 3, header:'Marriage Party',status:'tomorrow',scheduledTime : 'Today 05:45', text: 'Lithium', actions : []},
  {id: 4, header:'Interview',status:'in 6 days',scheduledTime : 'Today 05:45', text: 'Beryllium', actions : []},
  {id: 5, header:'Interview',status:'in 2 days',scheduledTime : 'Today 05:45', text: 'Boron', actions : []},  
];

/**
 * @title Basic use of `<table mat-table>`
 */
@Component({
  selector: 'app-reminders-list',
  styleUrls: ['list.component.scss'],
  templateUrl: 'list.component.html',
})
export class ListComponent {
  displayedColumns: string[] = ['id', 'header', 'text','scheduledTime','status',"actions"];
  dataSource = ELEMENT_DATA;
}