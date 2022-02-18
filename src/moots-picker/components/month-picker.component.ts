import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DateTime } from 'luxon';

import { CalendarMonth } from '../calendar.model';
import { defaults } from '../config';

@Component({
  selector: 'moots-calendar-month-picker',
  styleUrls: ['./month-picker.component.scss'],
  template: `
    <div [class]="'month-picker ' + color">
      <div
        class="month-packer-item"
        [class.this-month]="i === _thisMonth.month && month.original.year === _thisMonth.month"
        *ngFor="let item of _monthFormat; let i = index"
      >
        <button type="button" (click)="_onSelect(i)">{{ item }}</button>
      </div>
    </div>
  `
})
export class MonthPickerComponent {
  @Input()
  month: CalendarMonth;
  @Input()
  color = defaults.COLOR;
  @Output()
  select: EventEmitter<number> = new EventEmitter();
  _thisMonth = DateTime.utc();
  _monthFormat = defaults.MONTH_FORMAT;

  @Input()
  set monthFormat(value: string[]) {
    if (Array.isArray(value) && value.length === 12) {
      this._monthFormat = value;
    }
  }

  get monthFormat(): string[] {
    return this._monthFormat;
  }

  constructor() {
    /**/
  }

  _onSelect(month: number): void {
    this.select.emit(month);
  }
}
