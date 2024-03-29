import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DateTime } from 'luxon';

import { PickMode, PickerModal, PickerModalOptions } from '../moots-picker';

@Component({
  selector: 'demo-modal-basic',
  template: ` <ion-button (click)="openCalendar()"> basic </ion-button> `
})
export class DemoModalBasicComponent {
  date = DateTime.utc();
  dateRange = {
    from: this.date.plus({ hours: 1 }).toMillis(),
    to: this.date.plus({ hours: 1 }).toMillis()
  };

  myCalendar: HTMLIonModalElement;

  constructor(public modalCtrl: ModalController) {}

  async openCalendar() {
    const options: PickerModalOptions = {
      pickMode: PickMode.RANGE,
      title: 'RANGE',
      defaultDateRange: this.dateRange,
      weekStart: 1,
      step: 4,
      locale: 'en-GB'
    };
    this.myCalendar = await this.modalCtrl.create({
      component: PickerModal,
      componentProps: { options }
    });

    this.myCalendar.present();

    const event: any = await this.myCalendar.onDidDismiss();
    const { data: date, role } = event;

    if (role === 'done') {
      const from = DateTime.fromMillis(date.from).toUTC();
      const to = DateTime.fromMillis(date.to).toUTC();

      console.log(from.toString(), to.toString());
    }
  }
}
