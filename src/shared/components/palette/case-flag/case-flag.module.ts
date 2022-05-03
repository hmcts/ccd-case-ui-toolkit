import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, NgModule, Provider } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReadCaseFlagFieldComponent, WriteCaseFlagFieldComponent } from '.';
import { FormModule } from '../../../../components/form/form.module';
import { CaseFlagRefdataService } from '../../../services';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { CaseEditComponent } from '../../case-editor/case-edit/case-edit.component';
import {
  AddCommentsComponent,
  CaseFlagTableComponent,
  ManageCaseFlagsComponent,
  SearchLanguageInterpreterComponent,
  SelectFlagLocationComponent,
  SelectFlagTypeComponent,
  UpdateFlagComponent
} from './components';

@NgModule({
  imports: [
    CommonModule,
    FormModule,
    ReactiveFormsModule,
    MatAutocompleteModule
  ],
  providers: [
    CaseEditComponent,
    CaseEditPageComponent,
    ChangeDetectorRef as Provider,
    CaseFlagRefdataService
  ],
  declarations: [
    ReadCaseFlagFieldComponent,
    WriteCaseFlagFieldComponent,
    CaseFlagTableComponent,
    SelectFlagTypeComponent,
    SearchLanguageInterpreterComponent,
    SelectFlagLocationComponent,
    ManageCaseFlagsComponent,
    AddCommentsComponent
    UpdateFlagComponent
  ],
  exports: [
    ManageCaseFlagsComponent,
    ReadCaseFlagFieldComponent,
    WriteCaseFlagFieldComponent
  ]
})
export class CaseFlagModule {}
