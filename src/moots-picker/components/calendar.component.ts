import { Component, EventEmitter, Input, OnInit, Output, Provider, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';



import { CalendarComponentMonthChange, CalendarComponentOptions, CalendarComponentPayloadTypes, CalendarDay, CalendarMonth, PickMode, PickerModalOptions } from '../calendar.model';
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
    _d: PickerModalOptions;
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
    change: EventEmitter<CalendarComponentPayloadTypes> = new EventEmitter();
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
            this.monthOpt = this.createMonth(this.monthOpt.original.time);
        }
    }

    get options(): CalendarComponentOptions {
        return this._options;
    }

    constructor(public calSvc: CalendarService) { }

    ngOnInit(): void {
        this.initOpt();
        this.monthOpt = this.createMonth(new Date().getTime());
    }

    getViewDate() {
        return moment(this.monthOpt.original.time);
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
        if (moment(this.monthOpt.original.time).year() === 1970) {
            return;
        }
        const backTime = moment(this.monthOpt.original.time)
            .subtract(1, 'year')
            .valueOf();
        this.monthOpt = this.createMonth(backTime);
    }

    nextYear(): void {
        const nextTime = moment(this.monthOpt.original.time)
            .add(1, 'year')
            .valueOf();
        this.monthOpt = this.createMonth(nextTime);
    }

    nextMonth(): void {
        const nextTime = moment(this.monthOpt.original.time)
            .add(1, 'months')
            .valueOf();
        this.monthChange.emit({
            oldMonth: this.calSvc.multiFormat(this.monthOpt.original.time),
            newMonth: this.calSvc.multiFormat(nextTime)
        });
        this.monthOpt = this.createMonth(nextTime);
    }

    canNext(): boolean {
        if (!this._d.to || this._view !== 'days') {
            return true;
        }
        return this.monthOpt.original.time < moment(this._d.to).valueOf();
    }

    backMonth(): void {
        const backTime = moment(this.monthOpt.original.time)
            .subtract(1, 'months')
            .valueOf();
        this.monthChange.emit({
            oldMonth: this.calSvc.multiFormat(this.monthOpt.original.time),
            newMonth: this.calSvc.multiFormat(backTime)
        });
        this.monthOpt = this.createMonth(backTime);
    }

    canBack(): boolean {
        if (!this._d.from || this._view !== 'days') {
            return true;
        }
        return this.monthOpt.original.time > moment(this._d.from).valueOf();
    }

    monthOnSelect(month: number): void {
        this._view = 'days';
        const newMonth = moment(this.monthOpt.original.time)
            .month(month)
            .valueOf();
        this.monthChange.emit({
            oldMonth: this.calSvc.multiFormat(this.monthOpt.original.time),
            newMonth: this.calSvc.multiFormat(newMonth)
        });
        this.monthOpt = this.createMonth(newMonth);
    }

    onChanged($event: CalendarDay[]): void {
        switch (this._d.pickMode) {
            case PickMode.SINGLE:
                const date = moment($event[0].time);
                this._onChanged(date);
                this.change.emit(date);
                break;

            case PickMode.RANGE:
                if ($event[0] && $event[1]) {
                    const rangeDate = {
                        from: moment($event[0].time),
                        to: moment($event[1].time)
                    };
                    this._onChanged(rangeDate);
                    this.change.emit(rangeDate);
                }
                break;

            case PickMode.MULTI:
                const dates = [];

                for (const evnt of $event) {
                    if (evnt && evnt.time) {
                        dates.push(moment(evnt.time));
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

    _onChanged = (_date: any) => {/**/ };

    _onTouched = () => {/**/ };

    _payloadToTimeNumber(value: CalendarComponentPayloadTypes): number {
        const date = moment(value);
        return date.valueOf();
    }

    _monthFormat(date: number): string {
        return moment(date).format(this._d.monthFormat.replace(/y/g, 'Y'));
    }

    private initOpt(): void {
        if (
            this._options &&
            typeof this._options.showToggleButtons === 'boolean'
        ) {
            this.showToggleButtons = this._options.showToggleButtons;
        }
        if (
            this._options &&
            typeof this._options.showMonthPicker === 'boolean'
        ) {
            this.showMonthPicker = this._options.showMonthPicker;
            if (this._view !== 'days' && !this.showMonthPicker) {
                this._view = 'days';
            }
        }
        this._d = this.calSvc.safeOpt(this._options || {});
    }

    createMonth(date: number): CalendarMonth {
        return this.calSvc.createMonthsByPeriod(date, 1, this._d)[0];
    }

    _createCalendarDay(value: string): CalendarDay {
        return this.calSvc.createCalendarDay(this._payloadToTimeNumber(value), this._d);
    }

    writeValue(obj: any): void {
        this._writeValue(obj);
        if (obj) {
            if (this._calendarMonthValue[0]) {
                this.monthOpt = this.createMonth(
                    this._calendarMonthValue[0].time
                );
            } else {
                this.monthOpt = this.createMonth(new Date().getTime());
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

        switch (this._d.pickMode) {
            case PickMode.SINGLE:
                this._calendarMonthValue[0] = this._createCalendarDay(value);
                break;

            case PickMode.RANGE:
                if (value.from) {
                    this._calendarMonthValue[0] = value.from
                        ? this._createCalendarDay(value.from)
                        : undefined;
                }
                if (value.to) {
                    this._calendarMonthValue[1] = value.to
                        ? this._createCalendarDay(value.to)
                        : undefined;
                }
                break;

            case PickMode.MULTI:
                if (Array.isArray(value)) {
                    this._calendarMonthValue = value.map(e => {
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
