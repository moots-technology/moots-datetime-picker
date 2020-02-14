import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { CalendarDay, CalendarMonth, CalendarOriginal, PickMode } from '../calendar.model';
import { defaults } from '../config';

export const MONTH_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MonthComponent),
    multi: true
};

@Component({
    selector: 'moots-calendar-month',
    providers: [MONTH_VALUE_ACCESSOR],
    styleUrls: ['./month.component.scss'],
    templateUrl: './month.component.html'
})
export class MonthComponent implements ControlValueAccessor, AfterViewInit {
    @Input()
    month: CalendarMonth;
    @Input()
    pickMode: PickMode;
    @Input()
    isSaveHistory: boolean;
    @Input()
    id: any;
    @Input()
    readonly = false;
    @Input()
    color: string = defaults.COLOR;
    @Input()
    selectBegin = true;

    @Output()
    change: EventEmitter<CalendarDay[]> = new EventEmitter();
    @Output()
    select: EventEmitter<CalendarDay> = new EventEmitter();
    @Output()
    selectStart: EventEmitter<CalendarDay> = new EventEmitter();
    @Output()
    selectEnd: EventEmitter<CalendarDay> = new EventEmitter();

    _date: (CalendarDay | undefined)[] = [undefined, undefined];
    _isInit = false;
    _onChanged: () => void;
    _onTouched: () => void;

    get _isRange(): boolean {
        return this.pickMode === PickMode.RANGE;
    }

    constructor(public ref: ChangeDetectorRef) {}

    ngAfterViewInit(): void {
        this._isInit = true;
    }

    get value() {
        return this._date;
    }

    writeValue(obj: any): void {
        if (Array.isArray(obj)) {
            this._date = obj;
        }
    }

    registerOnChange(fn: any): void {
        this._onChanged = fn;
    }

    registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }

    trackByTime(index: number, item: CalendarOriginal): number {
        return item ? item.time : index;
    }

    isEndSelection(day: CalendarDay): boolean {
        if (!day) {
            return false;
        }
        if (
            this.pickMode !== PickMode.RANGE ||
            !this._isInit ||
            this._date[1] === undefined
        ) {
            return false;
        }

        return this._date[1].time === day.time;
    }

    isBetween(day: CalendarDay): boolean {
        if (!day) {
            return false;
        }

        if (this.pickMode !== PickMode.RANGE || !this._isInit) {
            return false;
        }

        if (this._date[0] === undefined || this._date[1] === undefined) {
            return false;
        }

        const start = this._date[0].time;
        const end = this._date[1].time;

        return day.time < end && day.time > start;
    }

    isStartSelection(day: CalendarDay): boolean {
        if (!day) {
            return false;
        }
        if (
            this.pickMode !== PickMode.RANGE ||
            !this._isInit ||
            this._date[0] === undefined
        ) {
            return false;
        }

        return this._date[0].time === day.time && this._date[1] !== undefined;
    }

    isSelected(time: number): boolean {
        if (Array.isArray(this._date)) {
            if (this.pickMode !== PickMode.MULTI) {
                if (this._date[0] !== undefined) {
                    return time === this._date[0].time;
                }

                if (this._date[1] !== undefined) {
                    return time === this._date[1].time;
                }
            } else {
                return (
                    this._date.findIndex(
                        e => e !== undefined && e.time === time
                    ) !== -1
                );
            }
        } else {
            return false;
        }
    }

    onSelected(item: CalendarDay): void {
        if (this.readonly) {
            return;
        }
        item.selected = true;
        this.select.emit(item);
        if (this.pickMode === PickMode.SINGLE) {
            this._date[0] = item;
            this.change.emit(this._date);
            return;
        }

        if (this.pickMode === PickMode.RANGE) {
            if (this._date[0] === undefined || this.selectBegin) {
                this._date[0] = item;
                if (
                    this._date[1] !== undefined &&
                    this._date[0].time >= this._date[1].time
                ) {
                    this._date[1] = undefined;
                }
                this.selectStart.emit(item);
            } else if (this._date[1] === undefined || !this.selectBegin) {
                if (this._date[0].time < item.time) {
                    this._date[1] = item;
                    this.selectEnd.emit(item);
                } else {
                    this._date[1] = undefined;
                }
            } else {
                this._date[0] = item;
                this.selectStart.emit(item);
                this._date[1] = undefined;
            }
            this.change.emit(this._date);
            return;
        }

        if (this.pickMode === PickMode.MULTI) {
            const index = this._date.findIndex(
                e => e !== undefined && e.time === item.time
            );

            if (index === -1) {
                this._date.push(item);
            } else {
                this._date.splice(index, 1);
            }
            this.change.emit(this._date.filter(e => e !== undefined));
        }
    }
}
