![Build](https://github.com/moots-technology/moots-datetime-picker/actions/workflows/node.js.yml/badge.svg)

# Moots Datetime Picker

The most intuitive and beautiful date & time picker for ionic. Moots datetime picker allows you to set single dates or date ranges in an easy and intuitive way. It features a calendar and clock picker with support for 12 and 24 hour mode. Choose your desired date with the help of our beautiful and easy-to-use interface. Dark mode supported.

![140523162-9b537321-d76a-442b-bd1a-edd5a6bf411c](https://user-images.githubusercontent.com/59689061/154686013-09a8e47b-414b-4854-8ab2-f43cc1822c0e.png)![140523171-c4ac6d2a-de5d-4b81-a48a-c1d07a23b6fe](https://user-images.githubusercontent.com/59689061/154686022-b1ed9517-836d-494c-b864-3cde4a185fa3.png)

![140523186-0554ae75-cad9-4c84-8b05-9629cfec4ac9](https://user-images.githubusercontent.com/59689061/154686041-189e4ec8-fd54-4677-bdc7-180a7d5c2915.png)![140523196-fdb91465-3052-4fd9-8e23-65563e2aa978](https://user-images.githubusercontent.com/59689061/154686051-7674b32d-11bf-4e8b-a128-14f0b65cb65f.png)


# Versions

| Datetime Picker-Version | Angular-Version |
|---|---|
| <=0.2.9 | Angular 8  |
| >=0.3.0 | Angular 12 |


# Live Demo

Please find a live demo on [Stackblitz](https://moots-picker-demo.stackblitz.io)

Notes:
- Certain features might not work properly on stackblitz - but work in a real project
- The clock picker is optimised for touch control, thus set your view to a mobile device

# Install

Dependencies:

`npm i luxon @angular/cdk @angular/flex-layout @angular/animations`

The picker:

`npm i moots-datetime-picker`

# Note about time zones

The picker is time zone agnostic. All input is expected to be in UTC, all calculations are done without regard to user time zone and locale, and all output is in UTC. When you select a certain date and time on the picker, you will get that displayed date and time in UTC format. Any locale specific transformations must happen outside of the picker.

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
    date = new DateTime();
    dateRange = {
        from: this.date.valueOf(),
        to: this.date.valueOf()
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
      const startDate = DateTime.fromMillis(event.data.from, { zone: 'Etc/UTC' });
      const endDate = DateTime.fromMillis(event.data.to, { zone: 'Etc/UTC' });
      console.log(startDate);
      console.log(endDate);
    }

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

# About

[moots technology](https://mootstech.com.au) is an Adelaide, South Australia based consultancy and software development company with a huge expertise in usage requirements analysis and cloud architecture frameworks for creating modern software solutions. Hereby we prioritise high usability and amazing UX over adding further features.
