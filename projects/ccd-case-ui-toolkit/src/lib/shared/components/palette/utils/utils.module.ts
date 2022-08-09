import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashPipe } from './dash.pipe';
import { DatePipe } from './date.pipe';
import { FieldLabelPipe } from './field-label.pipe';
import { FirstErrorPipe } from './first-error.pipe';
import { IsCompoundPipe } from './is-compound.pipe';
import { IsMandatoryPipe } from './is-mandatory.pipe';
import { IsReadOnlyAndNotCollectionPipe } from './is-read-only-and-not-collection.pipe';
import { IsReadOnlyPipe } from './is-read-only.pipe';

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
    IsReadOnlyAndNotCollectionPipe,
    DashPipe
  ],
  exports: [
    DatePipe,
    FieldLabelPipe,
    FirstErrorPipe,
    IsCompoundPipe,
    IsMandatoryPipe,
    IsReadOnlyPipe,
    IsReadOnlyAndNotCollectionPipe,
    DashPipe
  ]
})
export class PaletteUtilsModule {}
