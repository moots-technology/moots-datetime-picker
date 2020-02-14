import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostBinding, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IonContent, ModalController, NavParams } from '@ionic/angular';
import * as momentNs from 'moment';
// tslint:disable-next-line:no-import-side-effect
import 'moment-duration-format';

import { CalendarDay, CalendarMonth, GlobalPickState, PickMode, PickerModalOptions } from '../calendar.model';
import { CalendarService } from '../services/calendar.service';

import { ClockPickState, ClockPickerComponent } from './clock-picker.component';

const moment = momentNs;

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
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('400ms', style({ opacity: 0 }))
      ])
    ]),
    trigger('highlight', [
      state(
        'active',
        style({
          'box-shadow': '0 5px 15px 0 rgba(0, 0, 0, 0.5)',
          border: 'solid 2px #f8e71c',
        })
      ),
      state(
        'inactive',
        style({
          'box-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
          border: 'solid 2px transparent',
        })
      ),
      transition('* => *', [animate('0.2s')]),
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
  @ViewChild('clockPicker', { static: false })
  clockPicker: ClockPickerComponent;

  @HostBinding('class.ion-page')
  ionPage = true;

  @Input()
  options: PickerModalOptions;

  datesTemp: CalendarDay[] = [undefined, undefined];
  timesTemp: momentNs.Moment[] = [undefined, undefined];
  calendarMonths: CalendarMonth[];
  step: number;
  showYearPicker: boolean;
  year: number;
  years: number[];
  _scrollLock = true;
  _d: PickerModalOptions;
  actualFirstTime: number;

  pickState = GlobalPickState.BEGIN_DATE;
  clockPickState = ClockPickState.HOUR;

  constructor(
    private _renderer: Renderer2,
    public _elementRef: ElementRef,
    public params: NavParams,
    public modalCtrl: ModalController,
    public ref: ChangeDetectorRef,
    public calSvc: CalendarService
  ) { }

  is24Hours() {
    return this._d.locale && this._d.locale.indexOf('de') >= 0;
  }

  onSelectChange(cstate: ClockPickState) {
    this.clockPickState = cstate;
  }

  onClockValue(time: momentNs.Moment) {
    if (this.isBegin(this.pickState)) {
      this.timesTemp[0] = time;
    } else {
      this.timesTemp[1] = time;
    }

    this.preventInvalidRange();

    switch (this.pickState) {
      case (GlobalPickState.BEGIN_HOUR) : this.setPickState(GlobalPickState.BEGIN_MINUTE); break;
      case (GlobalPickState.BEGIN_MINUTE) : this.setPickState(GlobalPickState.END_DATE); break;
      case (GlobalPickState.END_HOUR) : this.setPickState(GlobalPickState.END_MINUTE); break;
    }
  }

  preventInvalidRange() {
    if (!this.datesTemp[1] || moment(this.datesTemp[0].time).day() === moment(this.datesTemp[1].time).day()) {
      if (this.timesTemp[0].valueOf() > this.timesTemp[1].valueOf()) {
        if (this.isBegin(this.pickState)) {
          this.timesTemp[1] = this.timesTemp[0].clone().add(15, 'minutes');
        } else {
          this.timesTemp[0] = this.timesTemp[1].clone().subtract(15, 'minutes');
        }
      }
    }
  }

  getDateString(index: number) {
    if (!this.datesTemp[index]) {
      index--;
    }
    return moment(this.datesTemp[index].time).format('LL');
  }

  getTimeHours(index: number) {
    const mom = this.timesTemp[index];
    const hours = this.is24Hours() ? mom.hours() : (mom.hours() > 12 ? mom.hours() % 12 : mom.hours());
    const dur = moment.duration(hours, 'hour');
    return dur
      .format('HH', {
        trim: false
      })
      .toString();
  }

  getTimeMinutes(index: number) {
    return moment
      .duration(this.timesTemp[index].minutes(), 'minute')
      .format('mm', {
        trim: false
      })
      .toString();
  }

  getAmPm(index: number) {
    return this.timesTemp[index].format('A');
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
    this.scrollToDate(moment(this.datesTemp[0].time));
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
    this.scrollToDate(moment(this.datesTemp[0].time));
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
    if (this._d.canBackwardsSelected) {
      this.backwardsMonth();
    }
  }

  init(): void {
    this._d = this.calSvc.safeOpt(this.options);
    this._d.showAdjacentMonthDay = false;
    this.step = this._d.step;
    if (this.step > this.calSvc.DEFAULT_STEP) {
      this.step = this.calSvc.DEFAULT_STEP;
    }
    moment.locale(this._d.locale);

    this.calendarMonths = this.calSvc.createMonthsByPeriod(
      moment(this._d.from).valueOf(),
      this.findInitMonthNumber(this._d.defaultScrollTo) + this.step,
      this._d
    );

    this.setPickState(this._d.pickState);
  }

  initDefaultDate(): void {
    const {
      pickMode,
      // defaultDate,
      defaultDateRange,
      defaultDates
    } = this._d;
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
            this.datesTemp[0] = this.calSvc.createCalendarDay(
              this._getDayTime(defaultDateRange.from),
              this._d
            );
            this.timesTemp[0] = moment(defaultDateRange.from);
          }
          if (defaultDateRange.to) {
            this.datesTemp[1] = this.calSvc.createCalendarDay(
              this._getDayTime(defaultDateRange.to),
              this._d
            );
            if ((moment(defaultDateRange.from).valueOf() >= moment(defaultDateRange.to).valueOf())
            ) {
              this.datesTemp[1] = undefined;
              this.timesTemp[1] = this.timesTemp[0]
                .clone()
                .add(30, 'minutes');
            } else {
              this.timesTemp[1] = moment(defaultDateRange.to);
            }
          }
        }
        if (this.timesTemp[0].minutes() % 5 > 0) {
          this.timesTemp[0].minutes(
            this.timesTemp[0].minutes() -
            (this.timesTemp[0].minutes() % 5)
          );
        }
        if (this.timesTemp[1].minutes() % 5 > 0) {
          this.timesTemp[1].minutes(
            this.timesTemp[1].minutes() -
            (this.timesTemp[1].minutes() % 5)
          );
        }
        break;
      case PickMode.MULTI:
        if (defaultDates && defaultDates.length) {
          this.datesTemp = defaultDates.map(e =>
            this.calSvc.createCalendarDay(
              this._getDayTime(e),
              this._d
            )
          );
        }
        break;
      default:
        this.datesTemp = [undefined, undefined];
    }
  }

  findCssClass(): void {
    const { cssClass } = this._d;
    if (cssClass) {
      cssClass.split(' ').forEach((_class: string) => {
        if (_class.trim() !== '') {
          this._renderer.addClass(
            this._elementRef.nativeElement,
            _class
          );
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

    this._d.tapticConf.onCalendarSelect();
    this.ref.detectChanges();

    // if (pickMode !== pickModes.MULTI && autoDone && this.canDone()) {
    //   this.done();
    // }

    this.repaintDOM();
    if (this.options.changeListener) {
      this.options.changeListener(data);
    }

    if (this.canDone()) {
      if (this.pickState === GlobalPickState.END_DATE) {
        setTimeout(() => {
          if (!this._d.fullday) {
            this.onClickEndHour(undefined);
          }
        }, 200);
      } else {
        setTimeout(() => {
            if (this._d.fullday) {
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
    const { pickMode } = this._d;

    this.modalCtrl.dismiss(
      this.calSvc.wrapResult(this.datesTemp, this.timesTemp, pickMode),
      'done'
    );
  }

  canDone(): boolean {
    return true;
  }

  nextMonth(event: any): void {
    const len = this.calendarMonths.length;
    const final = this.calendarMonths[len - 1];
    const nextTime = moment(final.original.time)
      .add(1, 'M')
      .valueOf();
    const rangeEnd = this._d.to ? moment(this._d.to).subtract(1, 'M') : 0;

    if (
      len <= 0 ||
      (rangeEnd !== 0 && moment(final.original.time).isAfter(rangeEnd))
    ) {
      event.target.disabled = true;
      return;
    }

    this.calendarMonths.push(
      ...this.calSvc.createMonthsByPeriod(
        nextTime,
        NUM_OF_MONTHS_TO_CREATE,
        this._d
      )
    );
    event.target.complete();
    this.repaintDOM();
  }

  backwardsMonth(): void {
    const first = this.calendarMonths[0];

    if (first.original.time <= 0) {
      this._d.canBackwardsSelected = false;
      return;
    }

    const firstTime = (this.actualFirstTime = moment(first.original.time)
      .subtract(NUM_OF_MONTHS_TO_CREATE, 'M')
      .valueOf());

    this.calendarMonths.unshift(
      ...this.calSvc.createMonthsByPeriod(
        firstTime,
        NUM_OF_MONTHS_TO_CREATE,
        this._d
      )
    );
    this.ref.detectChanges();
    this.repaintDOM();
  }

  scrollToDate(date: momentNs.Moment): void {
    const defaultDateIndex = this.findInitMonthNumber(date);
    const monthElement = this.monthsEle.nativeElement.children[
      `month-${defaultDateIndex}`
    ];
    const domElemReadyWaitTime = 300;

    setTimeout(() => {
      const defaultDateMonth = monthElement ? monthElement.offsetTop : 0;

      if (defaultDateIndex !== -1 && defaultDateMonth !== 0) {
        this.content.scrollByPoint(0, defaultDateMonth, 128);
      }
    }, domElemReadyWaitTime);
  }

  scrollToDefaultDate(): void {
    this.scrollToDate(this._d.defaultScrollTo);
  }

  onScroll($event: any): void {
    if (!this._d.canBackwardsSelected) {
      return;
    }

    const { detail } = $event;

    if (
      detail.scrollTop <= 200 &&
      detail.velocityY < 0 &&
      this._scrollLock
    ) {
      this.content.getScrollElement().then(scrollElem => {
        this._scrollLock = !1;

        const heightBeforeMonthPrepend = scrollElem.scrollHeight;
        this.backwardsMonth();
        setTimeout(() => {
          const heightAfterMonthPrepend = scrollElem.scrollHeight;

          this.content
            .scrollByPoint(
              0,
              heightAfterMonthPrepend - heightBeforeMonthPrepend,
              0
            )
            .then(() => {
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
    return this.content.getScrollElement().then(scrollElem => {
      // Update scrollElem to ensure that height of the container changes as Months are appended/prepended
      scrollElem.style.zIndex = '2';
      scrollElem.style.zIndex = 'initial';
      // Update monthsEle to ensure selected state is reflected when tapping on a day
      this.monthsEle.nativeElement.style.zIndex = '2';
      this.monthsEle.nativeElement.style.zIndex = 'initial';
    });
  }

  findInitMonthNumber(date: momentNs.Moment): number {
    let startDate = this.actualFirstTime
      ? moment(this.actualFirstTime)
      : moment(this._d.from);
    const defaultScrollTo = moment(date);
    const isAfter: boolean = defaultScrollTo.isAfter(startDate);
    if (!isAfter) {
      return -1;
    }

    if (this.showYearPicker) {
      startDate = moment(new Date(this.year, 0, 1));
    }

    return defaultScrollTo.diff(startDate, 'month');
  }

  _getDayTime(date: any): number {
    const mom = moment(date);
    return moment(mom.format('YYYY-MM-DD')).valueOf();
  }

  _monthFormat(date: any): string {
    return moment(date).format(this._d.monthFormat.replace(/y/g, 'Y'));
  }

  trackByIndex(index: number, momentDate: CalendarMonth): number {
    return momentDate.original ? momentDate.original.time : index;
  }

  isBegin(pstate: GlobalPickState): boolean {
    return pstate === GlobalPickState.BEGIN_DATE || pstate === GlobalPickState.BEGIN_HOUR || pstate === GlobalPickState.BEGIN_MINUTE;
  }

  isEnd(pstate: GlobalPickState): boolean {
    return ! this.isBegin(pstate);
  }

  isDate(pstate: GlobalPickState): boolean {
    return pstate === GlobalPickState.BEGIN_DATE || pstate === GlobalPickState.END_DATE;
  }

  isTime(pstate: GlobalPickState): boolean {
    return ! this.isDate(pstate);
  }

  isHour(pstate: GlobalPickState): boolean {
    return pstate === GlobalPickState.BEGIN_HOUR || pstate === GlobalPickState.END_HOUR;
  }

  isMinute(pstate: GlobalPickState): boolean {
    return pstate === GlobalPickState.BEGIN_MINUTE || pstate === GlobalPickState.END_MINUTE;
  }
}
