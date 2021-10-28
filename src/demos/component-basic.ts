import { Component } from '@angular/core';
import { DateTime } from 'luxon';

import { CalendarComponentOptions } from '../moots-picker';

@Component({
  selector: 'demo-component-basic',
  template: `
    <hr />
    <h3 style="text-align: center;">basic</h3>
    <moots-picker-calendar [(ngModel)]="date" (onChange)="onChange($event)" [options]="options" type="string" format="yyyy-MM-DD">
    </moots-picker-calendar>
  `
})
export class DemoComponentBasicComponent {
  date: DateTime = DateTime.now();
  options: CalendarComponentOptions = {
    from: this.date.toMillis()
  };

  constructor() {
    /**/
  }

  onChange($event: any) {
    console.log($event);
  }
}
