import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { DemosModule } from '../../demos/demos.module';
import { MootsPickerModule } from '../../moots-picker';

import { HomePage } from './home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MootsPickerModule,
    DemosModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage,
      },
    ]),
    FlexLayoutModule
  ],
  declarations: [HomePage],
})
export class HomePageModule {}
