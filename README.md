# About

[moots technology](https://mootstech.com.au) is an Adelaide, South Australia based consultancy and software development company with a huge expertise in usage requirements analysis and cloud architecture frameworks for creating modern software solutions. Hereby we prioritise high usability and amazing UX over adding further features.

# Optimised Datetime Picker for Ionic

An easy to use and beautiful ionic date & time picker with calendar and clock component for single dates and date ranges. Dark mode supported.

![chrome_lQWuHjZYoU](https://user-images.githubusercontent.com/59689061/140523162-9b537321-d76a-442b-bd1a-edd5a6bf411c.png)![chrome_YxnD0GDuyj](https://user-images.githubusercontent.com/59689061/140523171-c4ac6d2a-de5d-4b81-a48a-c1d07a23b6fe.png)

![chrome_5IxbdCg6t0](https://user-images.githubusercontent.com/59689061/140523186-0554ae75-cad9-4c84-8b05-9629cfec4ac9.png)![chrome_cGnmRxHYn8](https://user-images.githubusercontent.com/59689061/140523196-fdb91465-3052-4fd9-8e23-65563e2aa978.png)


# Versions

| Datetime Picker-Version | Angular-Version |
|---|---|
| <=0.2.9 | Angular 8 |
| >=0.3.0 | Angular 12|



# Live Demo

Please find a live demo on [Stackblitz](https://moots-picker-demo.stackblitz.io)

Notes:
- Certain features might not work properly on stackblitz - but work in a real project
- The clock picker is optimised for touch control, thus set your view to a mobile device

# Install

Dependencies (angular flex-layout):

`npm i moment @angular/cdk @angular/flex-layout @angular/animations`

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

Please find below an example as a quick start guide to get the picker running.

## Modal

```ts
export class DemoModalBasicComponent {
    date: moment.Moment = moment();
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

# Development Notes

To release a new version, commit all your changes and run:
- `npm version patch` to increment the version
- `npm run packagr` to build the library package
- `npm publish dist` to pubish it to npmjs
