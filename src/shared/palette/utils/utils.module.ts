import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from './date.pipe';
import { FirstErrorPipe } from './first-error.pipe';
import { FieldLabelPipe } from './field-label.pipe';
import { IsCompoundPipe } from './is-compound.pipe';
import { IsReadOnlyPipe } from './is-read-only.pipe';
import { IsMandatoryPipe } from './is-mandatory.pipe';
import { DashPipe } from './dash.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DatePipe,
    FieldLabelPipe,
    FirstErrorPipe,
    IsCompoundPipe,
    IsMandatoryPipe,
    IsReadOnlyPipe,
    DashPipe,
  ],
  exports: [
    DatePipe,
    FieldLabelPipe,
    FirstErrorPipe,
    IsCompoundPipe,
    IsMandatoryPipe,
    IsReadOnlyPipe,
    DashPipe,
  ]
})
export class PaletteUtilsModule {}
