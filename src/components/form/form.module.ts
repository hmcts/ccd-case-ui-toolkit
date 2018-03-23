import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateInputComponent } from './date-input/date-input.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    DateInputComponent,
  ],
  exports: [
    DateInputComponent,
  ]
})
export class FormModule {}
