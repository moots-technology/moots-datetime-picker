# Moots Datetime Picker

A beautiful ionic date & time picker with calendar and clock component for single dates and ranges.
Brought to you by [run-e](http://run-e.com) for [moots](https://moots.io).

[Live Stackblitz Demo](https://moots-datetime-picker-demo.stackblitz.io)

Notes:
- Certain features might not work properly on stackblitz - but should work in a real project
- The clock picker is optimized for touch control, make sure to use a mobile device view

![](https://i.imgur.com/U8lrlqD.png)
![](https://i.imgur.com/53LWKAo.png)

# Install

Moment for date handling and angular flex-layout dependencies:

`npm i moment moment-duration-format @angular/cdk @angular/flex-layout @angular/animations`

The picker:

`npm i moots-datetime-picker`

# Usage

Import the `MootsPickerModule` and dependencies in your `AppModule`:

```ts
@NgModule({
  ...
  imports: [
    IonicModule.forRoot(MyApp),
    FlexLayoutModule,
    BrowserAnimationsModule,
    MootsPickerModule
  ],
  ...
})
export class AppModule {}
```

You can use the following examples as a quick start to get the picker working in your project.

## Modal

```ts
export class DemoModalBasicComponent {
    date: momentNs.Moment = moment();
    dateRange = {
        from: this.date,
        to: this.date
    };

    myCalendar;

  constructor(public modalCtrl: ModalController) {}

  async openCalendar() {
    const options: PickerModalOptions = {
        pickMode: PickMode.RANGE,
        title: 'RANGE',
        defaultDateRange: this.dateRange,
        weekStart: 1,
        step: 4,
        locale: 'de'
    };

    this.myCalendar = await this.modalCtrl.create({
        component: PickerModal,
        componentProps: { options }
    });

    this.myCalendar.present();

    const event: any = await this.myCalendar.onDidDismiss();
    const { data: date, role } = event;

    if (role === 'done') {
      this.startDate = moment(event.data.from.dateObj);
      this.endDate = moment(event.data.to.dateObj);
    }
    console.log(this.startDate);
    console.log(this.endDate);
    console.log('role', role);
  }
}
```

## Component

Coming soon!
