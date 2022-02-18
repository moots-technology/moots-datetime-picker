import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { DateTime } from 'luxon';

import { DemoModalBasicComponent } from './modal-basic';

describe('DemoModalBasicComponent', () => {
  let component: DemoModalBasicComponent;
  let fixture: ComponentFixture<DemoModalBasicComponent>;
  beforeEach(() => {
    const modalControllerStub = { create: () => ({}) };
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [DemoModalBasicComponent],
      providers: [{ provide: ModalController, useValue: modalControllerStub }]
    });
    fixture = TestBed.createComponent(DemoModalBasicComponent);
    component = fixture.componentInstance;
  });

  // ===================== TESTS =====================
  it('can load instance', () => {
    expect(component).toBeTruthy();
  });

  it('return undefined on cancel', () => {
    const dismissSpy = spyOn(component.modalCtrlMock, 'dismiss');

    component.openCalendar();

    component.myPicker.onCancel();

    expect(dismissSpy).toHaveBeenCalledWith(undefined, 'cancel');
  });

  it('return input with duration 30 minutes if unchanged and no to-Date', () => {
    const testDate = DateTime.utc().plus({ hours: 1 }).startOf('minute');
    component.dateRange = {
      from: testDate.toMillis(),
      to: testDate.toMillis()
    };

    const dismissSpy = spyOn(component.modalCtrlMock, 'dismiss');

    component.openCalendar();

    component.myPicker.done();

    component.dateRange.to = testDate.plus({ minutes: 30 }).toMillis();

    expect(dismissSpy.calls.mostRecent().args[1]).toBe('done');

    expect(dismissSpy.calls.mostRecent().args[0].from.time).toBe(component.dateRange.from.valueOf());
    expect(dismissSpy.calls.mostRecent().args[0].to.time).toBe(component.dateRange.to.valueOf());
  });

  it('return input if valid to-from supplied', () => {
    const testDate = DateTime.utc().plus({ hours: 1 }).startOf('minute');
    component.dateRange = {
      from: testDate.toMillis(),
      to: DateTime.utc().plus({ hours: 2 }).startOf('minute').toMillis()
    };

    const dismissSpy = spyOn(component.modalCtrlMock, 'dismiss');

    component.openCalendar();

    component.myPicker.done();

    expect(dismissSpy.calls.mostRecent().args[1]).toBe('done');

    expect(dismissSpy.calls.mostRecent().args[0].from.time).toBe(component.dateRange.from.valueOf());
    expect(dismissSpy.calls.mostRecent().args[0].to.time).toBe(component.dateRange.to.valueOf());
  });

  it('prevent invalid input dates from being returned', () => {
    const testDate = DateTime.utc().plus({ hours: 1 }).startOf('minute');
    const expectedTo = DateTime.utc().plus({ hours: 2 }).startOf('minute');
    component.dateRange = {
      from: testDate.toMillis(),
      to: testDate.minus({ hours: 2 }).toMillis()
    };

    const dismissSpy = spyOn(component.modalCtrlMock, 'dismiss');

    component.openCalendar();

    component.myPicker.done();

    expect(dismissSpy.calls.mostRecent().args[1]).toBe('done');

    expect(dismissSpy.calls.mostRecent().args[0].from.time).toBe(component.dateRange.from.valueOf());
    expect(dismissSpy.calls.mostRecent().args[0].to.time).toBe(expectedTo.valueOf());
  });
});
