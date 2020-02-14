import { Component } from '@angular/core';

@Component({
  template: `
  <moots-picker-modal #calendar>
    <div sub-header [style.backgroundColor]="'white'">
      <label>Date seleted: </label>
      <span *ngFor="let d of calendar.datesTemp; let i = index">
        <ion-button *ngIf="d" [color]="calendar._d.color" (click)="toDate(d.time)">{{d.time | date: 'dd/MM/yyyy'}}</ion-button>
      </span>
    </div>
  </moots-picker-modal>
  `,
})
export class SubHeaderCalendarModal {
  toDate(p: any) {
    console.log(p);
  }
}
