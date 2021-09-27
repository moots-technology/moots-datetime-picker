import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';



import { CalendarComponentOptions, PickMode } from '../moots-picker';

@Component({
  selector: 'demo-range',
  template: `
    <hr>
    <h3 style="text-align: center;">range</h3>
    <moots-picker-calendar [(ngModel)]="date"
                  (onChange)="onChange($event)"
                  [options]="options"
                  type="string"
                  format="YYYY-MM-DD">
    </moots-picker-calendar>
  `,
})
export class DemoRangeComponent {
  date: {
    from: string;
    to: string;
  } = {
    from: '2018-01-01',
    to: '2018-01-05',
  };
  options: CalendarComponentOptions = {
    from: moment(new Date(2000, 0, 1)),
    pickMode: PickMode.RANGE,
  };

  constructor(public modalCtrl: ModalController) {}

  onChange($event: any) {
    console.log($event);
  }
}
