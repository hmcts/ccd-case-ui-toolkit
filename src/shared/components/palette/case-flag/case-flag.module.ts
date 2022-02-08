import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ReadCaseFlagFieldComponent, WriteCaseFlagFieldComponent } from '.';
import { FormModule } from '../../../../components/form/form.module';
import { CaseFlagTableComponent } from './components';

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
  ],
  exports: [
    ReadCaseFlagFieldComponent,
    WriteCaseFlagFieldComponent,
    CaseFlagTableComponent
  ]
})
export class CaseFlagModule {}
