import { Component } from '@angular/core';

import { DemoModalBasicComponent } from '../../demos/demo-modal-basic';

function createSpyObj(_baseName: string, methodNames: string[]) {
  const obj: any = {};
  for (let i = 0; i < methodNames.length; i++) {
    obj[methodNames[i]] = () => {};
  }
  return obj;
}

class ModalControllerMock {
  public static instance(modalMock?: ModalMock): any {
    const instance = createSpyObj("ModalController", ["create"]);
    instance.create.and.returnValue(modalMock || ModalMock.instance());

    return instance;
  }
}

class ModalMock {
  public static instance(): any {
    let _dismissCallback: Function;
    const instance = createSpyObj("Modal", [
      "present",
      "dismiss",
      "onDidDismiss",
    ]);
    instance.present.and.returnValue(Promise.resolve());

    instance.dismiss.and.callFake(() => {
      _dismissCallback();
      return Promise.resolve();
    });

    instance.onDidDismiss.and.callFake((callback: Function) => {
      _dismissCallback = callback;
    });

    return instance;
  }
}

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
