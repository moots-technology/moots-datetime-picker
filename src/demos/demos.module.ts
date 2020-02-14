import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MootsPickerModule } from '../moots-picker';

import { DemoComponentBasicComponent } from './component-basic';
import { DemoModalBasicComponent } from './demo-modal-basic';
import { DemoMultiComponent } from './demo-multi';
import { DemoOptionsComponent } from './demo-options';
import { DemoRangeComponent } from './demo-range';
import { SubHeaderCalendarModal } from './sub-header-calendar-modal';

const COMPONENTS = [
  DemoModalBasicComponent,
  SubHeaderCalendarModal,
  DemoMultiComponent,
  DemoRangeComponent,
  DemoOptionsComponent,
  DemoComponentBasicComponent
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule, IonicModule, FormsModule, MootsPickerModule],
  exports: [...COMPONENTS],
  entryComponents: [...COMPONENTS],
})
export class DemosModule {}
