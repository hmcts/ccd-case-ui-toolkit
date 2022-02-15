import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReadCaseFlagFieldComponent, WriteCaseFlagFieldComponent } from '.';
import { FormModule } from '../../../../components/form/form.module';
import { CaseFlagTableComponent, SelectFlagTypeComponent, SearchLanguageInterpreterComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    FormModule,
    ReactiveFormsModule,
    MatAutocompleteModule
  ],
  declarations: [
    ReadCaseFlagFieldComponent,
    WriteCaseFlagFieldComponent,
    CaseFlagTableComponent,
    SelectFlagTypeComponent,
    SearchLanguageInterpreterComponent
  ],
  exports: [
    ReadCaseFlagFieldComponent,
    WriteCaseFlagFieldComponent
  ]
})
export class CaseFlagModule {}
