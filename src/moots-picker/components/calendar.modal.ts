import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostBinding, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IonContent, ModalController, NavParams } from '@ionic/angular';
import { DateTime } from 'luxon';
import { CalendarDay, CalendarMonth, GlobalPickState, PickMode, PickerModalOptions, PickerModalOptionsSafe } from '../calendar.model';
import { CalendarService } from '../services/calendar.service';

import { ClockPickState, ClockPickerComponent } from './clock-picker.component';

const NUM_OF_MONTHS_TO_CREATE = 2;

@Component({
  selector: 'moots-picker-modal',
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 1
        })
      ),
      state(
        'closed',
        style({
          opacity: 0
        })
      ),
      transition('open => closed', [animate('0.4s')]),
      transition('closed => open', [animate('0.5s')])
    ]),
    trigger('enterAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('500ms', style({ opacity: 1 }))]),
      transition(':leave', [style({ opacity: 1 }), animate('400ms', style({ opacity: 0 }))])
    ]),
    trigger('highlight', [
      state(
        'active',
        style({
          'box-shadow': '0 5px 15px 0 rgba(0, 0, 0, 0.5)',
          border: 'solid 2px #f8e71c'
        })
      ),
      state(
        'inactive',
        style({
          'box-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
          border: 'solid 2px transparent'
        })
      ),
      transition('* => *', [animate('0.2s')])
    ])
  ],
  styleUrls: ['./calendar.modal.scss'],
  templateUrl: './calendar.modal.html'
})
export class PickerModal implements OnInit, AfterViewInit {
  GlobalPickState = GlobalPickState;
  PickMode = PickMode;

  @ViewChild(IonContent, { static: true })
  content: IonContent;
  @ViewChild('months', { static: true })
  monthsEle: ElementRef;
  @ViewChild('clockPicker')
  clockPicker: ClockPickerComponent;

  @HostBinding('class.ion-page')
  ionPage = true;

  @Input()
  options: PickerModalOptions;

  datesTemp: CalendarDay[] = [undefined, undefined];
  timesTemp: DateTime[] = [undefined, undefined];
  calendarMonths: CalendarMonth[];
  step: number;
  showYearPicker: boolean;
  year: number;
  years: number[];
  _scrollLock = true;
  modalOptions: PickerModalOptionsSafe;
  actualFirstTime: DateTime;

  pickState = GlobalPickState.BEGIN_DATE;
  clockPickState = ClockPickState.HOUR;

  constructor(
    private _renderer: Renderer2,
    public _elementRef: ElementRef,
    public params: NavParams,
    public modalCtrl: ModalController,
    public ref: ChangeDetectorRef,
    public calSvc: CalendarService
  ) {}

  localeUses24HourTime(locale: string) {
    return (
      new Intl.DateTimeFormat(locale, {
        hour: 'numeric'
      })
        .formatToParts(new Date(2020, 0, 1, 13))
        .find((part) => part.type === 'hour').value.length === 2
    );
  }

  is24Hours() {
    return this.modalOptions.locale && this.localeUses24HourTime(this.modalOptions.locale);
  }

  onSelectChange(cstate: ClockPickState) {
    this.clockPickState = cstate;
    switch (this.pickState) {
      case GlobalPickState.BEGIN_HOUR:
        this.setPickState(GlobalPickState.BEGIN_MINUTE);
        break;
      case GlobalPickState.BEGIN_MINUTE:
        this.setPickState(GlobalPickState.END_DATE);
        break;
      case GlobalPickState.END_HOUR:
        this.setPickState(GlobalPickState.END_MINUTE);
        break;
    }
  }

  onClockValue(time: DateTime) {
    if (this.isBegin(this.pickState)) {
      this.timesTemp[0] = time;
    } else {
      this.timesTemp[1] = time;
    }

    if (this.clockPickState == ClockPickState.HOUR) {
      return;
    }

    this.preventInvalidRange();

    switch (this.pickState) {
      case GlobalPickState.BEGIN_HOUR:
        this.setPickState(GlobalPickState.BEGIN_MINUTE);
        break;
      case GlobalPickState.BEGIN_MINUTE:
        this.setPickState(GlobalPickState.END_DATE);
        break;
      case GlobalPickState.END_HOUR:
        this.setPickState(GlobalPickState.END_MINUTE);
        break;
    }
  }

  preventInvalidRange() {
    if (
      !this.datesTemp[1] ||
      DateTime.fromMillis(this.datesTemp[0].time, { zone: 'Etc/UTC' }).day ===
        DateTime.fromMillis(this.datesTemp[1].time, { zone: 'Etc/UTC' }).day
    ) {
      if (this.timesTemp[0].valueOf() > this.timesTemp[1].valueOf()) {
        if (this.isBegin(this.pickState)) {
          this.timesTemp[1] = this.timesTemp[0].plus({ minutes: 15 });
        } else {
          const ampm = this.getAmPm(1);
          if (this.is24Hours() || ampm === 'pm') {
            this.timesTemp[0] = this.timesTemp[1].minus({ minutes: 15 });
          } else {
            const f = this.timesTemp[1].toFormat('t');
            const temp = DateTime.fromFormat(f.replace(ampm, 'pm'), 't', { zone: 'Etc/UTC' });
            console.log(temp);

            this.timesTemp[1] = this.timesTemp[1].set({ hour: temp.hour, minute: temp.minute });
          }
        }
      }
    }
  }

  getAmPm2(input: DateTime) {
    const s = input.toFormat('t');
    return s.substring(s.length - 2).toLowerCase();
  }

  getDateString(index: number) {
    if (!this.datesTemp[index]) {
      index--;
    }
    return DateTime.fromMillis(this.datesTemp[index].time, { zone: 'Etc/UTC' }).toLocaleString(DateTime.DATE_FULL);
  }

  getTimeHours(index: number) {
    return this.timesTemp[index].toFormat(this.is24Hours() ? 'HH' : 'hh');
  }

  getTimeMinutes(index: number) {
    return this.timesTemp[index].toFormat('mm');
  }

  getAmPm(index: number) {
    return this.getAmPm2(this.timesTemp[index]);
  }

  setPickState(pstate: GlobalPickState) {
    this.pickState = pstate;
    if (this.isHour(pstate)) {
      this.clockPickState = ClockPickState.HOUR;
    } else if (this.isMinute(pstate)) {
      this.clockPickState = ClockPickState.MINUTE;
    }
  }

  onClickStartDate() {
    this.setPickState(GlobalPickState.BEGIN_DATE);
    this.scrollToDate(DateTime.fromMillis(this.datesTemp[0].time, { zone: 'Etc/UTC' }));
  }

  onClickStartHour($event: Event) {
    this.setPickState(GlobalPickState.BEGIN_HOUR);
    if ($event) {
      $event.stopPropagation();
    }
  }

  onClickStartMin($event: Event) {
    this.setPickState(GlobalPickState.BEGIN_MINUTE);
    if ($event) {
      $event.stopPropagation();
    }
  }

  onClickEndDate() {
    this.setPickState(GlobalPickState.END_DATE);
    this.scrollToDate(DateTime.fromMillis(this.datesTemp[0].time, { zone: 'Etc/UTC' }));
  }

  onClickEndHour($event: Event) {
    this.setPickState(GlobalPickState.END_HOUR);
    if ($event) {
      $event.stopPropagation();
    }
  }

  onClickEndMin($event: Event) {
    this.setPickState(GlobalPickState.END_MINUTE);
    if ($event) {
      $event.stopPropagation();
    }
  }

  ngOnInit(): void {
    this.init();
    this.initDefaultDate();
  }

  ngAfterViewInit(): void {
    this.findCssClass();
    if (this.modalOptions.canBackwardsSelected) {
      this.backwardsMonth();
    }
  }

  init(): void {
    this.modalOptions = this.calSvc.safeOpt(this.options);
    this.modalOptions.showAdjacentMonthDay = false;
    this.step = this.modalOptions.step;
    if (this.step > this.calSvc.DEFAULT_STEP) {
      this.step = this.calSvc.DEFAULT_STEP;
    }

    this.calendarMonths = this.calSvc.createMonthsByPeriod(
      this.modalOptions.from,
      this.findInitMonthNumber(this.modalOptions.defaultScrollTo) + this.step,
      this.modalOptions
    );

    this.setPickState(this.modalOptions.pickState);
  }

  initDefaultDate(): void {
    const {
      pickMode,
      // defaultDate,
      defaultDateRange,
      defaultDates
    } = this.modalOptions;
    switch (pickMode) {
      case PickMode.SINGLE:
        // if (defaultDate) {
        //   this.datesTemp[0] = this.calSvc.createCalendarDay(
        //     this._getDayTime(defaultDate),
        //     this._d
        //   );
        //   this.datesTemp[1] = this.calSvc.createCalendarDay(
        //     this._getDayTime(defaultDate),
        //     this._d
        //   );
        // }
        // if ((nowMod.minutes() % 5) > 0) {
        //   nowMod.minutes(nowMod.minutes() - (nowMod.minutes() % 5));
        // }
        // this.timesTemp = [nowMod.format('hh:mm a'), nowMod.format('hh:mm a')];
        break;
      case PickMode.RANGE:
        if (defaultDateRange) {
          if (defaultDateRange.from) {
            this.datesTemp[0] = this.calSvc.createCalendarDay(this._getDayTime(defaultDateRange.from), this.modalOptions);
            this.timesTemp[0] = defaultDateRange.from;
          }
          if (defaultDateRange.to) {
            this.datesTemp[1] = this.calSvc.createCalendarDay(this._getDayTime(defaultDateRange.to), this.modalOptions);
            if (defaultDateRange.from >= defaultDateRange.to) {
              this.datesTemp[1] = undefined;
              this.timesTemp[1] = this.timesTemp[0].plus({
                minutes: 30
              });
            } else {
              this.timesTemp[1] = defaultDateRange.to;
            }
          }
        }
        if (this.timesTemp[0].minute % 5 > 0) {
          this.timesTemp[0] = this.timesTemp[0].set({ minute: this.timesTemp[0].minute - (this.timesTemp[0].minute % 5) });
        }
        if (this.timesTemp[1].minute % 5 > 0) {
          this.timesTemp[1] = this.timesTemp[1].set({ minute: this.timesTemp[1].minute - (this.timesTemp[1].minute % 5) });
        }
        break;
      case PickMode.MULTI:
        if (defaultDates && defaultDates.length) {
          this.datesTemp = defaultDates.map((e) => this.calSvc.createCalendarDay(this._getDayTime(e), this.modalOptions));
        }
        break;
      default:
        this.datesTemp = [undefined, undefined];
    }
  }

  findCssClass(): void {
    const { cssClass } = this.modalOptions;
    if (cssClass) {
      cssClass.split(' ').forEach((_class: string) => {
        if (_class.trim() !== '') {
          this._renderer.addClass(this._elementRef.nativeElement, _class);
        }
      });
    }
  }

  onChange(data: any): void {
    // const { pickMode, autoDone } = this._d;
    if (this.pickState === GlobalPickState.BEGIN_DATE) {
      this.datesTemp[0] = data[0];
    } else if (this.pickState === GlobalPickState.END_DATE) {
      this.datesTemp[1] = data[1];
    }

    this.modalOptions.tapticConf.onCalendarSelect();
    this.ref.detectChanges();

    // if (pickMode !== pickModes.MULTI && autoDone && this.canDone()) {
    //   this.done();
    // }

    this.repaintDOM();
    if (this.modalOptions.changeListener) {
      this.modalOptions.changeListener(data);
    }

    if (this.canDone()) {
      if (this.pickState === GlobalPickState.END_DATE) {
        setTimeout(() => {
          if (!this.modalOptions.fullday) {
            this.onClickEndHour(undefined);
          }
        }, 200);
      } else {
        setTimeout(() => {
          if (this.modalOptions.fullday) {
            this.onClickEndDate();
          } else {
            this.onClickStartHour(undefined);
          }
        }, 200);
      }
    }
  }

  onCancel(): void {
    this.modalCtrl.dismiss(undefined, 'cancel');
  }

  done(): void {
    const { pickMode } = this.modalOptions;

    this.preventInvalidRange();

    this.modalCtrl.dismiss(this.calSvc.wrapResult(this.datesTemp, this.timesTemp, pickMode), 'done');
  }

  canDone(): boolean {
    return true;
  }

  nextMonth(event: any): void {
    const len = this.calendarMonths.length;
    const final = this.calendarMonths[len - 1];
    const nextTime = DateTime.fromMillis(final.original.time, { zone: 'Etc/UTC' }).plus({ months: 1 });
    const rangeEnd = this.modalOptions.to ? this.modalOptions.to.minus({ months: 1 }) : 0;

    if (len <= 0 || (rangeEnd !== 0 && DateTime.fromMillis(final.original.time, { zone: 'Etc/UTC' }) < rangeEnd)) {
      event.target.disabled = true;
      return;
    }

    this.calendarMonths.push(...this.calSvc.createMonthsByPeriod(nextTime, NUM_OF_MONTHS_TO_CREATE, this.modalOptions));
    event.target.complete();
    this.repaintDOM();
  }

  backwardsMonth(): void {
    const first = this.calendarMonths[0];

    if (first.original.time <= 0) {
      this.modalOptions.canBackwardsSelected = false;
      return;
    }

    const firstTime = (this.actualFirstTime = DateTime.fromMillis(first.original.time, { zone: 'Etc/UTC' }).minus({
      months: NUM_OF_MONTHS_TO_CREATE
    }));

    this.calendarMonths.unshift(...this.calSvc.createMonthsByPeriod(firstTime, NUM_OF_MONTHS_TO_CREATE, this.modalOptions));
    this.ref.detectChanges();
    this.repaintDOM();
  }

  scrollToDate(date: DateTime): void {
    const defaultDateIndex = this.findInitMonthNumber(date);
    const monthElement = this.monthsEle.nativeElement.children[`month-${defaultDateIndex}`];
    const domElemReadyWaitTime = 300;

    setTimeout(() => {
      const defaultDateMonth = monthElement ? monthElement.offsetTop : 0;

      if (defaultDateIndex !== -1 && defaultDateMonth !== 0) {
        this.content.scrollByPoint(0, defaultDateMonth, 128);
      }
    }, domElemReadyWaitTime);
  }

  scrollToDefaultDate(): void {
    this.scrollToDate(this.modalOptions.defaultScrollTo);
  }

  onScroll($event: any): void {
    if (!this.modalOptions.canBackwardsSelected) {
      return;
    }

    const { detail } = $event;

    if (detail.scrollTop <= 200 && detail.velocityY < 0 && this._scrollLock) {
      this.content.getScrollElement().then((scrollElem) => {
        this._scrollLock = !1;

        const heightBeforeMonthPrepend = scrollElem.scrollHeight;
        this.backwardsMonth();
        setTimeout(() => {
          const heightAfterMonthPrepend = scrollElem.scrollHeight;

          this.content.scrollByPoint(0, heightAfterMonthPrepend - heightBeforeMonthPrepend, 0).then(() => {
            this._scrollLock = !0;
          });
        }, 180);
      });
    }
  }

  /**
   * In some older Safari versions (observed at Mac's Safari 10.0), there is an issue where style updates to
   * shadowRoot descendants don't cause a browser repaint.
   * See for more details: https://github.com/Polymer/polymer/issues/4701
   */
  repaintDOM() {
    return this.content.getScrollElement().then((scrollElem) => {
      // Update scrollElem to ensure that height of the container changes as Months are appended/prepended
      scrollElem.style.zIndex = '2';
      scrollElem.style.zIndex = 'initial';
      // Update monthsEle to ensure selected state is reflected when tapping on a day
      this.monthsEle.nativeElement.style.zIndex = '2';
      this.monthsEle.nativeElement.style.zIndex = 'initial';
    });
  }

  findInitMonthNumber(date: DateTime): number {
    let startDate = this.actualFirstTime ? this.actualFirstTime : this.modalOptions.from;
    const defaultScrollTo = date;
    const isAfter: boolean = defaultScrollTo > startDate;
    if (!isAfter) {
      return -1;
    }

    if (this.showYearPicker) {
      startDate = DateTime.fromJSDate(new Date(this.year, 0, 1), { zone: 'Etc/UTC' });
    }

    return defaultScrollTo.diff(startDate, 'months').milliseconds;
  }

  _getDayTime(date: DateTime): number {
    return DateTime.fromFormat(date.toFormat('yyyy-MM-dd'), 'yyyy-MM-dd', { zone: 'Etc/UTC' }).valueOf();
  }

  _monthFormat(date: DateTime): string {
    return date.toLocaleString({ year: 'numeric', month: 'short' });
  }

  trackByIndex(index: number, momentDate: CalendarMonth): number {
    return momentDate.original ? momentDate.original.time : index;
  }

  isBegin(pstate: GlobalPickState): boolean {
    return pstate === GlobalPickState.BEGIN_DATE || pstate === GlobalPickState.BEGIN_HOUR || pstate === GlobalPickState.BEGIN_MINUTE;
  }

  isEnd(pstate: GlobalPickState): boolean {
    return !this.isBegin(pstate);
  }

  isDate(pstate: GlobalPickState): boolean {
    return pstate === GlobalPickState.BEGIN_DATE || pstate === GlobalPickState.END_DATE;
  }

  isTime(pstate: GlobalPickState): boolean {
    return !this.isDate(pstate);
  }

  isHour(pstate: GlobalPickState): boolean {
    return pstate === GlobalPickState.BEGIN_HOUR || pstate === GlobalPickState.END_HOUR;
  }

  isMinute(pstate: GlobalPickState): boolean {
    return pstate === GlobalPickState.BEGIN_MINUTE || pstate === GlobalPickState.END_MINUTE;
  }
}
