import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';

import { PickMode, PickerModal, PickerModalOptions } from '../moots-picker';

@Component({
    selector: 'demo-modal-basic',
    template: `
        <ion-button (click)="openCalendar()"> basic </ion-button>
    `
})
export class DemoModalBasicComponent {
    date: moment.Moment = moment();
    dateRange = {
        from: this.date,
        to: this.date
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
            locale: window.navigator.language
        };

        this.myCalendar = await this.modalCtrl.create({
            component: PickerModal,
            componentProps: { options }
        });

        this.myCalendar.present();

        const event: any = await this.myCalendar.onDidDismiss();
        const { data: date, role } = event;

        if (role === 'done') {
            this.date = date.dateObj;
        }
    }
}
