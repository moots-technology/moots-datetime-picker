import { Component, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavParamsMock } from 'ionic-mocks';
import * as momentNs from 'moment';

const moment = momentNs;

import { PickMode, PickerModal, PickerModalOptions } from '../moots-picker';
import { CalendarService } from '../moots-picker/services/calendar.service';

import { CDRefMock, ModalCtrlMock, RendererMock } from './test-mocks';

@Component({
  selector: 'demo-modal-basic',
  template: `
    <ion-button (click)="openCalendar()">
      basic
    </ion-button>
  `,
})
/** Creates and opens a basic modal picker to be tested */
export class DemoModalBasicComponent {
  currentDate: momentNs.Moment = moment();
  dateRange = {
    from: this.currentDate,
    to: this.currentDate,
  };

  modalCtrlMock: ModalController = new ModalCtrlMock();
  myPicker: PickerModal;

  constructor() { /**/ }

  async openCalendar() {
    const options: PickerModalOptions = {
      pickMode: PickMode.RANGE,
      title: 'RANGE',
      defaultDateRange: this.dateRange,
      canBackwardsSelected: false,
      weekStart: 1,
      step: 4,
      locale: window.navigator.language,
    };

    const rendererMock = new RendererMock();
    const elemRefMock = new ElementRef(undefined);
    const cdRefMock = new CDRefMock();
    this.myPicker = new PickerModal(rendererMock, elemRefMock, NavParamsMock.instance(), this.modalCtrlMock, cdRefMock, new CalendarService());

    this.myPicker.options = options;
    this.myPicker.ngOnInit();
  }
}
