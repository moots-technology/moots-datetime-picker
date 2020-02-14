import { Component } from '@angular/core';
import * as momentNs from 'moment';

const moment = momentNs;

import { CalendarComponentOptions } from '../moots-picker';

@Component({
    selector: 'demo-component-basic',
    template: `
      <hr>
      <h3 style="text-align: center;">basic</h3>
      <moots-picker-calendar [(ngModel)]="date"
                    (onChange)="onChange($event)"
                    [options]="options"
                    type="string"
                    format="YYYY-MM-DD">
      </moots-picker-calendar>
    `,
  })
export class DemoComponentBasicComponent {
  date: momentNs.Moment = moment();
  options: CalendarComponentOptions = {
    from: this.date,
  };

  constructor() { /**/ }

  onChange($event: any) {
      console.log($event);
  }
}
