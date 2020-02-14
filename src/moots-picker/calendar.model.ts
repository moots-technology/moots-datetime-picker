import { AnimationBuilder } from '@ionic/core';
import * as momentNs from 'moment';

export enum GlobalPickState {
  BEGIN_DATE,
  BEGIN_HOUR,
  BEGIN_MINUTE,
  END_DATE,
  END_HOUR,
  END_MINUTE
}

export enum PickMode {
  SINGLE,
  MULTI,
  RANGE
}

export interface CalendarOriginal {
  time: number;
  date: momentNs.Moment;
  year: number;
  month: number;
  firstWeek: number;
  howManyDays: number;
}

export interface CalendarDay {
  time: number;
  isToday: boolean;
  selected: boolean;
  disable: boolean;
  cssClass: string;
  isLastMonth?: boolean;
  isNextMonth?: boolean;
  title?: string;
  subTitle?: string;
  marked?: boolean;
  style?: {
    title?: string;
    subTitle?: string;
  };
  isFirst?: boolean;
  isLast?: boolean;
}

export class CalendarMonth {
  original: CalendarOriginal;
  days: CalendarDay[];
}

export interface DayConfig {
  date: momentNs.Moment;
  marked?: boolean;
  disable?: boolean;
  title?: string;
  subTitle?: string;
  cssClass?: string;
}

export interface ModalOptions {
  showBackdrop?: boolean;
  backdropDismiss?: boolean;
  enterAnimation?: AnimationBuilder;
  leaveAnimation?: AnimationBuilder;
}

export interface PickerModalOptions extends CalendarOptions {
  autoDone?: boolean;
  format?: string;
  cssClass?: string;
  id?: string;
  isSaveHistory?: boolean;
  closeLabel?: string;
  doneLabel?: string;
  closeIcon?: boolean;
  doneIcon?: boolean;
  canBackwardsSelected?: boolean;
  title?: string;
  defaultScrollTo?: momentNs.Moment;
  defaultDate?: momentNs.Moment;
  defaultDates?: momentNs.Moment[];
  defaultDateRange?: { from: momentNs.Moment; to?: momentNs.Moment } | undefined;
  step?: number;
  changeListener?: (data: any) => any;
  locale?: string;
  startLabel?: string;
  endLabel?: string;
  fulldayLabel?: string;
  fullday?: boolean;
  tapticConf?: TapticConfig;
}

export interface TapticConfig {
    onClockHover?: () => void;
    onClockSelect?: () => void;
    onCalendarSelect?: () => void;
}

export interface CalendarOptions {
  from?: momentNs.Moment;
  to?: momentNs.Moment;
  pickMode?: PickMode;
  weekStart?: number;
  disableWeeks?: number[];
  weekdays?: string[];
  monthFormat?: string;
  color?: string;
  defaultTitle?: string;
  defaultSubtitle?: string;
  daysConfig?: DayConfig[];
  /**
   * show last month & next month days fill six weeks
   */
  showAdjacentMonthDay?: boolean;
  pickState?: GlobalPickState;
}

export interface CalendarComponentOptions extends CalendarOptions {
  showToggleButtons?: boolean;
  showMonthPicker?: boolean;
  monthPickerFormat?: string[];
}

export class CalendarResult {
  time: number;
  unix: number;
  dateObj: Date;
  string: string;
  years: number;
  months: number;
  date: number;
}

export class CalendarComponentMonthChange {
  oldMonth: CalendarResult;
  newMonth: CalendarResult;
}

export type Colors = 'primary' | 'secondary' | 'danger' | 'light' | 'dark' | string;
export type CalendarComponentPayloadTypes = string | Date | number | {};
