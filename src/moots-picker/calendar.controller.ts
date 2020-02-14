import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';

import { ModalOptions, PickerModalOptions } from './calendar.model';
import { PickerModal } from './components/calendar.modal';
import { CalendarService } from './services/calendar.service';

@Injectable()
export class CalendarController {
  constructor(public modalCtrl: ModalController, public calSvc: CalendarService) {}

  /**
   * @deprecated
   */
  openCalendar(calendarOptions: PickerModalOptions, modalOptions: ModalOptions = {}): Promise<{}> {
    const options = this.calSvc.safeOpt(calendarOptions);

    return this.modalCtrl
      .create({
        component: PickerModal,
        componentProps: {
          options,
        },
        ...modalOptions,
      })
      .then((pickerModal: HTMLIonModalElement) => {
        pickerModal.present();

        return pickerModal.onDidDismiss().then((event: OverlayEventDetail) => {
          return event.data ? Promise.resolve(event.data) : Promise.reject('cancelled');
        });
      });
  }
}
