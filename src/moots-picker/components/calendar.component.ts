import { Component, EventEmitter, Input, OnInit, Output, Provider, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateTime } from 'luxon';
import { PickerModalOptionsSafe } from '..';

import {
  CalendarComponentMonthChange,
  CalendarComponentOptions,
  CalendarComponentPayloadTypes,
  CalendarDay,
  CalendarMonth,
  PickMode
} from '../calendar.model';
import { defaults } from '../config';
import { CalendarService } from '../services/calendar.service';

export const ION_CAL_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CalendarComponent),
  multi: true
};

@Component({
  selector: 'moots-picker-calendar',
  providers: [ION_CAL_VALUE_ACCESSOR],
  styleUrls: ['./calendar.component.scss'],
  templateUrl: 'calendar.component.html'
})
export class CalendarComponent implements ControlValueAccessor, OnInit {
  modalOptions: PickerModalOptionsSafe;
  _options: CalendarComponentOptions;
  _view: 'month' | 'days' = 'days';
  _calendarMonthValue: CalendarDay[] = [undefined, undefined];

  _showToggleButtons = true;
  get showToggleButtons(): boolean {
    return this._showToggleButtons;
  }

  set showToggleButtons(value: boolean) {
    this._showToggleButtons = value;
  }

  _showMonthPicker = true;
  get showMonthPicker(): boolean {
    return this._showMonthPicker;
  }

  set showMonthPicker(value: boolean) {
    this._showMonthPicker = value;
  }

  monthOpt: CalendarMonth;

  @Input()
  format: string = defaults.DATE_FORMAT;
  @Input()
  readonly = false;
  @Output()
  change: EventEmitter<any> = new EventEmitter();
  @Output()
  monthChange: EventEmitter<CalendarComponentMonthChange> = new EventEmitter();
  @Output()
  select: EventEmitter<CalendarDay> = new EventEmitter();
  @Output()
  selectStart: EventEmitter<CalendarDay> = new EventEmitter();
  @Output()
  selectEnd: EventEmitter<CalendarDay> = new EventEmitter();

  @Input()
  set options(value: CalendarComponentOptions) {
    this._options = value;
    this.initOpt();
    if (this.monthOpt && this.monthOpt.original) {
      this.monthOpt = this.createMonth(this.monthOpt.original.date);
    }
  }

  get options(): CalendarComponentOptions {
    return this._options;
  }

  constructor(public calSvc: CalendarService) {}

  ngOnInit(): void {
    this.initOpt();
    this.monthOpt = this.createMonth(DateTime.utc());
  }

  getViewDate() {
    return this.monthOpt.original.date;
  }

  setViewDate(value: CalendarComponentPayloadTypes) {
    this.monthOpt = this.createMonth(this._payloadToTimeNumber(value));
  }

  switchView(): void {
    this._view = this._view === 'days' ? 'month' : 'days';
  }

  prev(): void {
    if (this._view === 'days') {
      this.backMonth();
    } else {
      this.prevYear();
    }
  }

  next(): void {
    if (this._view === 'days') {
      this.nextMonth();
    } else {
      this.nextYear();
    }
  }

  prevYear(): void {
    if (this.monthOpt.original.year === 1970) {
      return;
    }
    const backTime = this.monthOpt.original.date.minus({ years: 1 });
    this.monthOpt = this.createMonth(backTime);
  }

  nextYear(): void {
    const nextTime = this.monthOpt.original.date.plus({ years: 1 });
    this.monthOpt = this.createMonth(nextTime);
  }

  nextMonth(): void {
    const nextTime = this.monthOpt.original.date.plus({ months: 1 });
    this.monthChange.emit({
      oldMonth: this.calSvc.multiFormat(this.monthOpt.original.date.valueOf()),
      newMonth: this.calSvc.multiFormat(nextTime.valueOf())
    });
    this.monthOpt = this.createMonth(nextTime);
  }

  canNext(): boolean {
    if (!this.modalOptions.to || this._view !== 'days') {
      return true;
    }
    return this.monthOpt.original.date < this.modalOptions.to;
  }

  backMonth(): void {
    const backTime = this.monthOpt.original.date.minus({ months: 1 });
    this.monthChange.emit({
      oldMonth: this.calSvc.multiFormat(this.monthOpt.original.date.valueOf()),
      newMonth: this.calSvc.multiFormat(backTime.valueOf())
    });
    this.monthOpt = this.createMonth(backTime);
  }

  canBack(): boolean {
    if (!this.modalOptions.from || this._view !== 'days') {
      return true;
    }
    return this.monthOpt.original.date > this.modalOptions.from;
  }

  monthOnSelect(month: number): void {
    this._view = 'days';
    const newMonth = this.monthOpt.original.date.set({ month: month });
    this.monthChange.emit({
      oldMonth: this.calSvc.multiFormat(this.monthOpt.original.date.valueOf()),
      newMonth: this.calSvc.multiFormat(newMonth.valueOf())
    });
    this.monthOpt = this.createMonth(newMonth);
  }

  onChanged($event: CalendarDay[]): void {
    switch (this.modalOptions.pickMode) {
      case PickMode.SINGLE:
        const date = $event[0].time;
        this._onChanged(date);
        this.change.emit(date.toMillis());
        break;

      case PickMode.RANGE:
        if ($event[0] && $event[1]) {
          const rangeDate = {
            from: $event[0].time,
            to: $event[1].time
          };
          this._onChanged(rangeDate);
          this.change.emit(rangeDate);
        }
        break;

      case PickMode.MULTI:
        const dates = [];

        for (const evnt of $event) {
          if (evnt && evnt.time) {
            dates.push(evnt.time);
          }
        }

        this._onChanged(dates);
        this.change.emit(dates);
        break;

      default:
    }
  }

  swipeEvent($event: any): void {
    const isNext = $event.deltaX < 0;
    if (isNext && this.canNext()) {
      this.nextMonth();
    } else if (!isNext && this.canBack()) {
      this.backMonth();
    }
  }

  _onChanged = (_date: any) => {
    /**/
  };

  _onTouched = () => {
    /**/
  };

  _payloadToTimeNumber(value: CalendarComponentPayloadTypes): DateTime {
    const date = DateTime.fromMillis(value as number, { zone: 'Etc/UTC' });
    return date;
  }

  _monthFormat(date: DateTime): string {
    return date?.toFormat(this.modalOptions.monthFormat.replace('yyyy', ''));
  }

  private initOpt(): void {
    if (this._options && typeof this._options.showToggleButtons === 'boolean') {
      this.showToggleButtons = this._options.showToggleButtons;
    }
    if (this._options && typeof this._options.showMonthPicker === 'boolean') {
      this.showMonthPicker = this._options.showMonthPicker;
      if (this._view !== 'days' && !this.showMonthPicker) {
        this._view = 'days';
      }
    }
    this.modalOptions = this.calSvc.safeOpt(this._options || {});
  }

  createMonth(date: DateTime): CalendarMonth {
    return this.calSvc.createMonthsByPeriod(date, 1, this.modalOptions)[0];
  }

  _createCalendarDay(_value: string): CalendarDay {
    return this.calSvc.createCalendarDay(this._payloadToTimeNumber(12), this.modalOptions);
  }

  writeValue(obj: any): void {
    this._writeValue(obj);
    if (obj) {
      if (this._calendarMonthValue[0]) {
        this.monthOpt = this.createMonth(this._calendarMonthValue[0].time);
      } else {
        this.monthOpt = this.createMonth(DateTime.utc());
      }
    }
  }

  registerOnChange(fn: () => {}): void {
    this._onChanged = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  _writeValue(value: any): void {
    if (!value) {
      this._calendarMonthValue = [undefined, undefined];
      return;
    }

    switch (this.modalOptions.pickMode) {
      case PickMode.SINGLE:
        this._calendarMonthValue[0] = this._createCalendarDay(value);
        break;

      case PickMode.RANGE:
        if (value.from) {
          this._calendarMonthValue[0] = value.from ? this._createCalendarDay(value.from) : undefined;
        }
        if (value.to) {
          this._calendarMonthValue[1] = value.to ? this._createCalendarDay(value.to) : undefined;
        }
        break;

      case PickMode.MULTI:
        if (Array.isArray(value)) {
          this._calendarMonthValue = value.map((e) => {
            return this._createCalendarDay(e);
          });
        } else {
          this._calendarMonthValue = [undefined, undefined];
        }
        break;

      default:
    }
  }
}
