import { Component } from '@angular/core';
import { ModalControllerMock } from 'ionic-mocks';

import { DemoModalBasicComponent } from '../../demos/demo-modal-basic';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
    modal: DemoModalBasicComponent;

    init() {
        this.modal = new DemoModalBasicComponent(ModalControllerMock.instance());
        this.modal.openCalendar();
    }
}
