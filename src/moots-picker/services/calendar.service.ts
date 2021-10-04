import { Injectable } from '@angular/core';
import * as moment from 'moment';



import { CalendarDay, CalendarMonth, CalendarOriginal, CalendarResult, DayConfig, GlobalPickState, PickMode, PickerModalOptions } from '../calendar.model';
import { defaults } from '../config';

const isBoolean = (input: any) => input === true || input === false;

@Injectable()
export class CalendarService {
  constructor() {/**/}

  get DEFAULT_STEP() {
    return 12;
  }

  safeOpt(calendarOptions: any = {}): PickerModalOptions {
    const _disableWeeks: number[] = [];
    const _daysConfig: DayConfig[] = [];
    const {
      from = new Date(),
      to = 0,
      weekStart = 0,
      step = this.DEFAULT_STEP,
      id = '',
      cssClass = '',
      closeLabel = 'CANCEL',
      doneLabel = 'DONE',
      monthFormat = 'MMM YYYY',
      title = 'CALENDAR',
      defaultTitle = '',
      defaultSubtitle = '',
      autoDone = false,
      canBackwardsSelected = false,
      closeIcon = false,
      doneIcon = false,
    //   showYearPicker = false,
      isSaveHistory = false,
      pickMode = PickMode.SINGLE,
      color = defaults.COLOR,
      weekdays = defaults.WEEKS_FORMAT,
      daysConfig = _daysConfig,
      disableWeeks = _disableWeeks,
      showAdjacentMonthDay = true,
      locale = 'en',
      startLabel = 'Start',
      endLabel = 'End',
      fulldayLabel = 'All Day event',
      fullday = false,
      tapticConf = {
            onClockHover: () => { /**/ },
            onClockSelect: () => { /**/ },
            onCalendarSelect: () => { /**/ },
      },
      pickState = GlobalPickState.BEGIN_DATE
    } = calendarOptions || {};

    return {
      id,
      from,
      to,
      pickMode,
      autoDone,
      color,
      cssClass,
      weekStart,
      closeLabel,
      closeIcon,
      doneLabel,
      doneIcon,
      canBackwardsSelected,
      isSaveHistory,
      disableWeeks,
      monthFormat,
      title,
      weekdays,
      daysConfig,
      step,
      defaultTitle,
      defaultSubtitle,
      defaultScrollTo: calendarOptions.defaultScrollTo || from,
      defaultDate: calendarOptions.defaultDate || undefined,
      defaultDates: calendarOptions.defaultDates || undefined,
      defaultDateRange: calendarOptions.defaultDateRange || undefined,
      showAdjacentMonthDay,
      locale,
      startLabel,
      endLabel,
      fulldayLabel,
      fullday,
      tapticConf,
      pickState
    };
  }

  createOriginalCalendar(time: number): CalendarOriginal {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstWeek = new Date(year, month, 1).getDay();
    const howManyDays = moment(time).daysInMonth();
    return {
      year,
      month,
      firstWeek,
      howManyDays,
      time: new Date(year, month, 1).getTime(),
      date: moment(time),
    };
  }

  findDayConfig(day: any, opt: PickerModalOptions): any {
    if (opt.daysConfig.length <= 0) { return undefined; }
    return opt.daysConfig.find(n => day.isSame(n.date, 'day'));
  }

  createCalendarDay(time: number, opt: PickerModalOptions, month?: number): CalendarDay {
    const _time = moment(time);
    const date = moment(time);
    const isToday = moment().isSame(_time, 'days');
    const dayConfig = this.findDayConfig(_time, opt);
    const _rangeBeg = moment(opt.from).valueOf();
    const _rangeEnd = moment(opt.to).valueOf();
    let isBetween = true;
    const disableWee = opt.disableWeeks.indexOf(_time.toDate().getDay()) !== -1;
    if (_rangeBeg > 0 && _rangeEnd > 0) {
        isBetween = opt.canBackwardsSelected ? (moment(_time).isBefore(_rangeBeg) ? false : isBetween)
                                             : !_time.isBetween(_rangeBeg, _rangeEnd, 'days', '[]');
    } else if (_rangeBeg > 0 && _rangeEnd === 0) {
      if (!opt.canBackwardsSelected) {
        const _addTime = _time.add(1, 'day');
        isBetween = !_addTime.isAfter(_rangeBeg);
      } else {
        isBetween = false;
      }
    }

    let _disable = false;
    _disable = (dayConfig && isBoolean(dayConfig.disable)) ? dayConfig.disable : (disableWee || isBetween);

    let title = new Date(time).getDate().toString();
    if (dayConfig && dayConfig.title) {
      title = dayConfig.title;
    } else if (opt.defaultTitle) {
      title = opt.defaultTitle;
    }
    let subTitle = '';
    if (dayConfig && dayConfig.subTitle) {
      subTitle = dayConfig.subTitle;
    } else if (opt.defaultSubtitle) {
      subTitle = opt.defaultSubtitle;
    }

    return {
      time,
      isToday,
      title,
      subTitle,
      selected: false,
      isLastMonth: date.month() < month,
      isNextMonth: date.month() > month,
      marked: dayConfig ? dayConfig.marked || false : false,
      cssClass: dayConfig ? dayConfig.cssClass || '' : '',
      disable: _disable,
      isFirst: date.date() === 1,
      isLast: date.date() === date.daysInMonth(),
    };
  }

  createCalendarMonth(original: CalendarOriginal, opt: PickerModalOptions): CalendarMonth {
    const days: CalendarDay[] = new Array(6).fill(undefined);
    const len = original.howManyDays;
    for (let i = original.firstWeek; i < len + original.firstWeek; i++) {
      const itemTime = new Date(original.year, original.month, i - original.firstWeek + 1).getTime();
      days[i] = this.createCalendarDay(itemTime, opt);
    }

    const weekStart = opt.weekStart;

    if (weekStart === 1) {
      if (days[0] === undefined) {
        days.shift();
      } else {
        days.unshift(...new Array(6).fill(undefined));
      }
    }

    if (opt.showAdjacentMonthDay) {
      const _booleanMap = days.map(e => !!e);
      const thisMonth = moment(original.time).month();
      let startOffsetIndex = _booleanMap.indexOf(true) - 1;
      let endOffsetIndex = _booleanMap.lastIndexOf(true) + 1;
      for (startOffsetIndex; startOffsetIndex >= 0; startOffsetIndex--) {
        const dayBefore = moment(days[startOffsetIndex + 1].time)
          .clone()
          .subtract(1, 'd');
        days[startOffsetIndex] = this.createCalendarDay(dayBefore.valueOf(), opt, thisMonth);
      }

      if (!(_booleanMap.length % 7 === 0 && _booleanMap[_booleanMap.length - 1])) {
        for (endOffsetIndex; endOffsetIndex < days.length + (endOffsetIndex % 7); endOffsetIndex++) {
          const dayAfter = moment(days[endOffsetIndex - 1].time)
            .clone()
            .add(1, 'd');
          days[endOffsetIndex] = this.createCalendarDay(dayAfter.valueOf(), opt, thisMonth);
        }
      }
    }

    return {
      days,
      original
    };
  }

  createMonthsByPeriod(startTime: number, monthsNum: number, opt: PickerModalOptions): CalendarMonth[] {
    const _array: CalendarMonth[] = [];

    const _start = new Date(startTime);
    const _startMonth = new Date(_start.getFullYear(), _start.getMonth(), 1).getTime();

    for (let i = 0; i < monthsNum; i++) {
      const time = moment(_startMonth)
        .add(i, 'M')
        .valueOf();
      const originalCalendar = this.createOriginalCalendar(time);
      _array.push(this.createCalendarMonth(originalCalendar, opt));
    }

    return _array;
  }

  wrapResult(original: CalendarDay[], times: moment.Moment[], pickMode: PickMode) {
    const secondIndex = original[1] ? 1 : 0;
    let result: any;
    switch (pickMode) {
      case PickMode.SINGLE:
        result = this.multiFormat(original[0].time);
        break;
      case PickMode.RANGE:
        result = {
          from: this.multiFormat(moment(original[0].time).hours(times[0].hours()).minutes(times[0].minutes()).startOf('minute').valueOf()),
          to: this.multiFormat(moment(original[secondIndex].time).hours(times[1].hours()).minutes(times[1].minutes()).startOf('minute').valueOf()),
        };
        break;
      case PickMode.MULTI:
        result = original.map(e => this.multiFormat(e.time));
        break;
      default:
        result = original;
    }
    return result;
  }

  multiFormat(time: number): CalendarResult {
    const _moment = moment(time);
    return {
      time: _moment.valueOf(),
      unix: _moment.unix(),
      dateObj: _moment.toDate(),
      string: _moment.format(defaults.DATE_FORMAT),
      years: _moment.year(),
      months: _moment.month() + 1,
      date: _moment.date(),
    };
  }
}
