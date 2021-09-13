import { animate, keyframes, state, style, transition, trigger, } from '@angular/animations';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import * as momentNs from 'moment';

const moment = momentNs;

import { TapticConfig } from '../calendar.model';

interface Coordinate {
  x: number;
  y: number;
}

export enum ClockPickState {
  HOUR,
  MINUTE
}

@Component({
  selector: 'moots-clock-picker',
  animations: [
    trigger(
      'switch', [
      state('open', style({
        transform: 'scale(1)',
        opacity: 1
      })),
      state('closed', style({
        transform: 'scale(1)',
        opacity: 1
      })),
      transition('open <=> closed', [
        animate('0.5s ease-in-out', keyframes([
          style({ transform: 'scale(1.1)', opacity: 0.5, offset: 0.5 }),
        ]))
      ]),
    ]
    )
  ],
  styleUrls: ['./clock-picker.component.scss'],
  templateUrl: './clock-picker.component.html'
})
export class ClockPickerComponent {
  ClockPickState = ClockPickState;

  @Input() pickState = ClockPickState.HOUR;
  @Input() mode24 = true;

  _inputTime: momentNs.Moment;
  @Input() set inputTime(time: momentNs.Moment) {
    this._inputTime = time;
    let hour = time.format(this.mode24 ? 'HH' : 'hh');
    hour = hour.startsWith('0') ? hour.substr(1) : hour;
    this.setClockFromHour(hour);
    this.setClockFromMinute(time.format('mm'));
  }

  @Input() tapConf: TapticConfig;

  @Output()
  selectChange = new EventEmitter();
  @Output()
  valueSelected = new EventEmitter();

  @ViewChild('hourClock') hourClock: any;
  @ViewChild('minuteClock') minuteClock: any;

  hourSelected = '3';
  minuteSelected = '00';
  hourHandStyle: { transform: string; };
  minuteHandStyle: { transform: string; };
  lastClicked: any;
  outerHours = ['9', '10', '11', '12', '1', '2', '3', '4', '5', '6', '7', '8'];
  innerHours = ['21', '22', '23', '00', '13', '14', '15', '16', '17', '18', '19', '20'];
  minutes = ['45', '50', '55', '00', '05', '10', '15', '20', '25', '30', '35', '40'];

  constructor() {
    //
  }

  ionViewDidLoad() {
    this.setClockFromHour('00');
    this.setClockFromMinute('00');
  }

  getAmPm() {
    return this._inputTime.format('a');
  }

  setAmPm(arg: string) {
    const f = this._inputTime.format('hh:mm a');
    const temp = moment(f.replace(this.getAmPm(), arg), 'hh:mm a');
    this._inputTime.hours(temp.hours());
    this._inputTime.minutes(temp.minutes());
    this.selectChange.emit(this.pickState);
  }

  getHourNumber(): number {
    return parseInt(this.hourSelected, 10);
  }

  updatedClock(clicked: Coordinate) {
    this.lastClicked = clicked;
    const clock = this.pickState === ClockPickState.HOUR ? this.hourClock : this.minuteClock;
    if (clock) {
      const rectangle = clock.nativeElement.getBoundingClientRect();
      const clockCenter = {
        x: rectangle.width / 2 + rectangle.left,
        y: rectangle.height / 2 + rectangle.top
      };
      const angle =
        (Math.atan2(
          clockCenter.y - clicked.y,
          clockCenter.x - clicked.x
        ) * 180) / Math.PI;
      if (this.pickState === ClockPickState.HOUR) {
        const dist = ClockPickerComponent.calculateDistance(clockCenter.x, clicked.x, clockCenter.y, clicked.y);
        this.setHourFromAngle(angle, this.mode24 && dist < rectangle.height / 3);
      } else {
        this.setMinuteFromAngle(angle);
      }

      const time = this.hourSelected + ' ' + this.minuteSelected + (this.mode24 ? '' : this.getAmPm());
      const temp = moment(time, 'hh mm a');
      this._inputTime = this._inputTime.hours(temp.hours()).minutes(temp.minutes());
    }
  }

  draggedClock($event: any) {
    this.lastType = 'drag';
    $event.preventDefault();
    const clicked: Coordinate = {
      x: $event.changedTouches[0].clientX,
      y: $event.changedTouches[0].clientY
    };
    this.updatedClock(clicked);
  }

  lastType = '';
  tappedClock(event: any) {
    const clicked: Coordinate = {
      x: event.clientX,
      y: event.clientY
    };
    let fireEvents = false;
    if (event.type === 'touchend') {
      this.lastType = 'touchend';
      this.updatedClock(this.lastClicked);
      fireEvents = true;
    } else {
      if (this.lastType !== 'touchend') {
        this.updatedClock(clicked);
        fireEvents = true;
      }
      this.lastType = 'clicked';
      this.lastClicked = clicked;
    }
    if (fireEvents) {
      if (this.pickState === ClockPickState.HOUR) {
        this.valueSelected.emit(this._inputTime);
        this.pickState = ClockPickState.MINUTE;
        this.selectChange.emit(this.pickState);
      } else if (this.pickState === ClockPickState.MINUTE) {
        this.valueSelected.emit(this._inputTime);
      }
      this.tapConf.onClockSelect();
    }
  }

  /** Sets the clock hour handle according to hour parameter */
  setClockFromHour(hour: string) {
    const hourN = parseInt(hour, 10);
    const hours = hourN <= 12 && hourN > 0 ? this.outerHours : this.innerHours;
    hour = hour === '0' ? '00' : hour;
    const index = hours.indexOf(hour);
    if (index > -1 || index === -6) {
      const angle = Math.abs(index) * 30 - 90;
      this.hourHandStyle = {
        transform: `rotate(${angle}deg)`,
      };
    } else {
      const angle = 12 - Math.abs(index) * 30 - 105;
      this.hourHandStyle = {
        transform: `rotate(${angle}deg)`,
      };
    }
    this.hourSelected = hour;
  }

  /** Sets the clock minute handle according to minute parameter */
  setClockFromMinute(minute: string) {
    const index = this.minutes.indexOf(minute);
    if (index > -1 || index === -6) {
      this.minuteHandStyle = {
        transform: `rotate(${Math.abs(index) * 30 - 90}deg)`,
      };
    } else {
      this.minuteHandStyle = {
        transform: `rotate(${(12 - Math.abs(index)) * 30 - 105}deg)`,
      };
    }
    this.minuteSelected = minute;
  }

  setHourFromAngle(angle: number, inner: boolean) {
    const hours = inner ? this.innerHours : this.outerHours;
    const index = Math.round(angle / 30);
    let toSelect;
    if (index > -1 || index === -6) {
      toSelect = hours[Math.abs(index)];
      const angleC = Math.abs(index) * 30 - 90;
      this.hourHandStyle = {
        transform: `rotate(${angleC}deg)`,
      };
    } else {
      toSelect = hours[12 - Math.abs(index)];
      const angleC = (12 - Math.abs(index)) * 30 - 90;
      this.hourHandStyle = {
        transform: `rotate(${angleC}deg)`,
      };
    }
    if (toSelect !== this.hourSelected) {
      this.hourSelected = toSelect;
      this.tapConf.onClockHover();
    }
  }

  setMinuteFromAngle(angle: number) {
    const index = Math.round(angle / 30);
    let toSelect;
    if (index > -1 || index === -6) {
      toSelect = this.minutes[Math.abs(index)];
      this.minuteHandStyle = {
        transform: `rotate(${Math.abs(index) * 30 - 90}deg)`,
      };
    } else {
      toSelect = this.minutes[12 - Math.abs(index)];
      this.minuteHandStyle = {
        transform: `rotate(${(12 - Math.abs(index)) * 30 - 90}deg)`,
      };
    }
    if (toSelect !== this.minuteSelected) {
      this.minuteSelected = toSelect;
      this.tapConf.onClockHover();
    }
  }

  static calculateDistance(x1: number, x2: number, y1: number, y2: number) {
    const dis = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    return Math.abs(dis);
  }

}
