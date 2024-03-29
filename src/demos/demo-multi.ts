import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DateTime } from 'luxon';

import { CalendarComponentOptions, PickMode } from '../moots-picker';

@Component({
  selector: 'demo-multi',
  template: `
    <hr />
    <h3 style="text-align: center;">multi</h3>
    <moots-picker-calendar [(ngModel)]="date" (onChange)="onChange($event)" [options]="options" type="string" format="yyyy-MM-DD">
    </moots-picker-calendar>
  `
})
export class DemoMultiComponent {
  date: string[] = ['2018-01-01', '2018-01-02', '2018-01-05'];
  options: CalendarComponentOptions = {
    from: DateTime.fromJSDate(new Date(2000, 0, 1)).toMillis(),
    pickMode: PickMode.MULTI
  };

  constructor(public modalCtrl: ModalController) {}

  onChange($event: any) {
    console.log($event);
  }
}
