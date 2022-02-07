import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ReadCaseFlagFieldComponent, WriteCaseFlagFieldComponent } from '.';
import { FormModule } from '../../../../components/form/form.module';
import { CaseFlagTableComponent, SelectFlagTypeComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    FormModule,
    ReactiveFormsModule
  ],
  declarations: [
    ReadCaseFlagFieldComponent,
    WriteCaseFlagFieldComponent,
    CaseFlagTableComponent,
    SelectFlagTypeComponent
  ],
  exports: [
    ReadCaseFlagFieldComponent,
    WriteCaseFlagFieldComponent
  ]
})
export class CaseFlagModule {}
