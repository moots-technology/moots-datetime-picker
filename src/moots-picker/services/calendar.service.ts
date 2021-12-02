import { Injectable } from '@angular/core';
import { DateTime, Interval } from 'luxon';
import { payloadsToDateTime, PickerModalOptionsSafe } from '..';

import {
  CalendarDay,
  CalendarMonth,
  CalendarOriginal,
  DayConfig,
  GlobalPickState,
  PickMode,
  PickerModalOptions,
  payloadToDateTime
} from '../calendar.model';
import { defaults } from '../config';

const isBoolean = (input: any) => input === true || input === false;

@Injectable()
export class CalendarService {
  constructor() {
    /**/
  }

  get DEFAULT_STEP() {
    return 12;
  }

  safeOpt(calendarOptions: PickerModalOptions): PickerModalOptionsSafe {
    const _disableWeeks: number[] = [];
    const _daysConfig: DayConfig[] = [];
    const from = calendarOptions.from ? payloadToDateTime(calendarOptions.from) : DateTime.utc();
    const safeOpts: PickerModalOptionsSafe = {
      from: from,
      to: calendarOptions.to ? payloadToDateTime(calendarOptions.to) : DateTime.utc(),
      weekStart: calendarOptions.weekStart || 0,
      step: calendarOptions.step || this.DEFAULT_STEP,
      id: calendarOptions.id || '',
      cssClass: calendarOptions.cssClass || '',
      closeLabel: calendarOptions.closeLabel || 'CANCEL',
      doneLabel: calendarOptions.doneLabel || 'DONE',
      monthFormat: calendarOptions.monthFormat || 'MMM yyyy',
      title: calendarOptions.title || 'CALENDAR',
      defaultTitle: calendarOptions.defaultTitle || '',
      defaultSubtitle: calendarOptions.defaultSubtitle || '',
      autoDone: calendarOptions.autoDone || false,
      canBackwardsSelected: calendarOptions.canBackwardsSelected || false,
      closeIcon: calendarOptions.closeIcon || false,
      doneIcon: calendarOptions.doneIcon || false,
      //   showYearPicker: false,
      isSaveHistory: calendarOptions.isSaveHistory || false,
      pickMode: calendarOptions.pickMode || PickMode.SINGLE,
      color: calendarOptions.closeLabel || defaults.COLOR,
      weekdays: calendarOptions.weekdays || defaults.WEEKS_FORMAT,
      daysConfig: calendarOptions.daysConfig || _daysConfig,
      disableWeeks: calendarOptions.disableWeeks || _disableWeeks,
      showAdjacentMonthDay: calendarOptions.showAdjacentMonthDay && true,
      locale: calendarOptions.locale || 'en',
      startLabel: calendarOptions.startLabel || 'Start',
      endLabel: calendarOptions.endLabel || 'End',
      uses24Hours: calendarOptions.uses24Hours || detectHourCycle(),
      fulldayLabel: calendarOptions.fulldayLabel || 'All Day event',
      fullday: calendarOptions.fullday || false,
      defaultScrollTo: calendarOptions.defaultScrollTo ? payloadToDateTime(calendarOptions.defaultDate) : from,
      defaultDate: calendarOptions.defaultDate ? payloadToDateTime(calendarOptions.defaultDate) : undefined,
      defaultDates: calendarOptions.defaultDates ? payloadsToDateTime(calendarOptions.defaultDates) : undefined,
      defaultDateRange: calendarOptions.defaultDateRange
        ? { from: payloadToDateTime(calendarOptions.defaultDateRange.from), to: payloadToDateTime(calendarOptions.defaultDateRange.to) }
        : undefined,
      tapticConf: calendarOptions.tapticConf || {
        onClockHover: () => {
          /**/
        },
        onClockSelect: () => {
          /**/
        },
        onCalendarSelect: () => {
          /**/
        }
      },
      pickState: calendarOptions.pickState || GlobalPickState.BEGIN_DATE
    };

    return safeOpts;
  }

  multiFormat(time: number): number {
    return time;
  }

  createOriginalCalendar(time: number): CalendarOriginal {
    const date = DateTime.fromMillis(time, { zone: 'Etc/UTC' });
    const year = date.year;
    const month = date.month;
    const firstWeek = DateTime.utc(year, month, 1).weekday;
    const howManyDays = date.endOf('month').day;
    return {
      date,
      year,
      month,
      firstWeek,
      howManyDays
    };
  }

  findDayConfig(day: DateTime, opt: PickerModalOptionsSafe): any {
    if (opt.daysConfig.length <= 0) {
      return undefined;
    }
    return opt.daysConfig.find((n) => day.hasSame(n.date, 'day'));
  }

  createCalendarDay(time: DateTime, opt: PickerModalOptionsSafe, month?: number): CalendarDay {
    const date = time;
    const isToday = DateTime.utc().hasSame(date, 'day');
    const isBeforeToday = DateTime.utc().startOf('day') > date;
    const dayConfig = this.findDayConfig(date, opt);
    const _rangeBeg = opt.from.valueOf();
    const _rangeEnd = opt.to.valueOf();
    let isBetween = true;
    const disableWee = opt.disableWeeks.indexOf(date.toJSDate().getDay()) !== -1;
    if (_rangeBeg > 0 && _rangeEnd > 0) {
      isBetween = opt.canBackwardsSelected
        ? date.valueOf() < _rangeBeg
          ? false
          : isBetween
        : Interval.fromDateTimes(opt.from, opt.to).contains(date);
    } else if (_rangeBeg > 0 && _rangeEnd === 0) {
      if (!opt.canBackwardsSelected) {
        const _addTime = date.plus({ days: 1 });
        isBetween = !(_addTime.valueOf() > _rangeBeg);
      } else {
        isBetween = false;
      }
    }

    let _disable = false;
    _disable = dayConfig && isBoolean(dayConfig.disable) ? dayConfig.disable : disableWee || isBetween;
    if (isBeforeToday && !opt.canBackwardsSelected) {
      _disable = true;
    }

    let title = time.day.toString();
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
      isLastMonth: date.month < month,
      isNextMonth: date.month > month,
      marked: dayConfig ? dayConfig.marked || false : false,
      cssClass: dayConfig ? dayConfig.cssClass || '' : '',
      disable: _disable,
      isFirst: date.day === 1,
      isLast: date.day === date.daysInMonth
    };
  }

  createCalendarMonth(original: CalendarOriginal, opt: PickerModalOptionsSafe): CalendarMonth {
    const days: CalendarDay[] = new Array(6).fill(undefined);
    const len = original.howManyDays;
    for (let i = original.firstWeek; i < len + original.firstWeek; i++) {
      days[i] = this.createCalendarDay(original.date.plus({ days: i - original.firstWeek }), opt);
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
      const _booleanMap = days.map((e) => !!e);
      const thisMonth = original.date.month;
      let startOffsetIndex = _booleanMap.indexOf(true) - 1;
      let endOffsetIndex = _booleanMap.lastIndexOf(true) + 1;
      for (startOffsetIndex; startOffsetIndex >= 0; startOffsetIndex--) {
        const dayBefore = days[startOffsetIndex + 1].time.minus({ days: 1 });
        days[startOffsetIndex] = this.createCalendarDay(dayBefore, opt, thisMonth);
      }

      if (!(_booleanMap.length % 7 === 0 && _booleanMap[_booleanMap.length - 1])) {
        for (endOffsetIndex; endOffsetIndex < days.length + (endOffsetIndex % 7); endOffsetIndex++) {
          const dayAfter = days[endOffsetIndex - 1].time.plus({ days: 1 });
          days[endOffsetIndex] = this.createCalendarDay(dayAfter, opt, thisMonth);
        }
      }
    }

    return {
      days,
      original
    };
  }

  createMonthsByPeriod(startDate: DateTime, monthsNum: number, opt: PickerModalOptionsSafe): CalendarMonth[] {
    const _array: CalendarMonth[] = [];

    const startOfMonth = startDate.startOf('month');

    for (let i = 0; i < monthsNum; i++) {
      const time = startOfMonth.plus({ months: i }).valueOf();
      const originalCalendar = this.createOriginalCalendar(time);
      _array.push(this.createCalendarMonth(originalCalendar, opt));
    }

    return _array;
  }

  wrapResult(original: CalendarDay[], times: DateTime[], pickMode: PickMode) {
    const secondIndex = original[1] ? 1 : 0;
    let result: any;
    switch (pickMode) {
      case PickMode.SINGLE:
        result = this.multiFormat(original[0].time.valueOf());
        break;
      case PickMode.RANGE:
        result = {
          from: this.multiFormat(
            DateTime.fromMillis(original[0].time.valueOf(), { zone: 'Etc/UTC' })
              .set({
                hour: times[0].hour,
                minute: times[0].minute
              })
              .startOf('minute')
              .valueOf()
          ),
          to: this.multiFormat(
            DateTime.fromMillis(original[secondIndex].time.valueOf(), { zone: 'Etc/UTC' })
              .set({
                hour: times[1].hour,
                minute: times[1].minute
              })
              .startOf('minute')
              .valueOf()
          )
        };
        break;
      case PickMode.MULTI:
        result = original.map((e) => this.multiFormat(e.time.valueOf()));
        break;
      default:
        result = original;
    }
    return result;
  }
}

function detectHourCycle(): boolean {
  return (
    new Intl.DateTimeFormat(DateTime.now().toLocal().locale, {
      hour: 'numeric'
    })
      .formatToParts(new Date(2020, 0, 1, 13))
      .find((part) => part.type === 'hour').value.length === 2
  );
}
