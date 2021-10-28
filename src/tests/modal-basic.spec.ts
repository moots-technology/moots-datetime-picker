import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ModalController } from "@ionic/angular";

import { DemoModalBasicComponent } from "./modal-basic";

describe("DemoModalBasicComponent", () => {
    let component: DemoModalBasicComponent;
    let fixture: ComponentFixture<DemoModalBasicComponent>;
    beforeEach(() => {
        const modalControllerStub = { create: () => ({}) };
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [DemoModalBasicComponent],
            providers: [
                { provide: ModalController, useValue: modalControllerStub },
            ],
        });
        fixture = TestBed.createComponent(DemoModalBasicComponent);
        component = fixture.componentInstance;
    });

    // ===================== TESTS =====================
    it("can load instance", () => {
        expect(component).toBeTruthy();
    });

    it("return undefined on cancel", () => {
        const dismissSpy = spyOn(component.modalCtrlMock, "dismiss");

        component.openCalendar();

        component.myPicker.onCancel();

        expect(dismissSpy).toHaveBeenCalledWith(undefined, "cancel");
    });

    it("return input with duration 30 minutes if unchanged and no to-Date", () => {
        const testDate = moment().add(1, "hour").minutes(0).startOf("minute");
        component.dateRange = {
            from: testDate,
            to: testDate,
        };

        const dismissSpy = spyOn(component.modalCtrlMock, "dismiss");

        component.openCalendar();

        component.myPicker.done();

        component.dateRange.to = moment(testDate).add(30, "minute");

        expect(dismissSpy.calls.mostRecent().args[1]).toBe("done");

        expect(dismissSpy.calls.mostRecent().args[0].from.time).toBe(
            moment(component.dateRange.from).valueOf()
        );
        expect(dismissSpy.calls.mostRecent().args[0].to.time).toBe(
            moment(component.dateRange.to).valueOf()
        );
    });

    it("return input if valid to-from supplied", () => {
        const testDate = moment().add(1, "hour").minutes(0).startOf("minute");
        component.dateRange = {
            from: testDate,
            to: moment().add(2, "hour").minutes(0).startOf("minute"),
        };

        const dismissSpy = spyOn(component.modalCtrlMock, "dismiss");

        component.openCalendar();

        component.myPicker.done();

        expect(dismissSpy.calls.mostRecent().args[1]).toBe("done");

        expect(dismissSpy.calls.mostRecent().args[0].from.time).toBe(
            moment(component.dateRange.from).valueOf()
        );
        expect(dismissSpy.calls.mostRecent().args[0].to.time).toBe(
            moment(component.dateRange.to).valueOf()
        );
    });

    it("prevent invalid input dates from being returned", () => {
        const testDate = moment().add(1, "hour").minutes(0).startOf("minute");
        const expectedTo = moment(testDate).add(30, "minute");
        component.dateRange = {
            from: testDate,
            to: moment(testDate).subtract(2, "hour"),
        };

        const dismissSpy = spyOn(component.modalCtrlMock, "dismiss");

        component.openCalendar();

        component.myPicker.done();

        expect(dismissSpy.calls.mostRecent().args[1]).toBe("done");

        expect(dismissSpy.calls.mostRecent().args[0].from.time).toBe(
            moment(component.dateRange.from).valueOf()
        );
        expect(dismissSpy.calls.mostRecent().args[0].to.time).toBe(
            moment(expectedTo).valueOf()
        );
    });
});
