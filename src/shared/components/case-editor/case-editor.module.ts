import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CallbackErrorsComponent } from '../../components/error';
import { MarkdownModule } from '../../components/markdown';
import { ConditionalShowModule, ConditionalShowRegistrarService, LabelSubstitutorModule } from '../../directives';
import { PipesModule } from '../../pipes/pipes.module';
import {
  AddressesService,
  CaseFieldService,
  DocumentManagementService,
  FieldsPurger,
  FieldsUtils,
  FieldTypeSanitiser,
  FormErrorService,
  FormValueService,
  OrderService,
  ProfileNotifier,
  ProfileService,
  RouterHelperService,
} from '../../services';
import { ErrorsModule } from '../error/errors.module';
import { ComplexModule, PaletteModule } from '../palette';
import { CaseCreateComponent } from './case-create';
import { CaseEditConfirmComponent } from './case-edit-confirm';
import { CaseEditFormComponent } from './case-edit-form';
import { CaseEditPageComponent } from './case-edit-page';
import { CaseEditSubmitComponent } from './case-edit-submit';
import { CaseEditComponent } from './case-edit/case-edit.component';
import { CaseProgressComponent } from './case-progress';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';
import {
  CaseEditWizardGuard,
  EventTriggerService,
  PageValidationService,
  WizardFactoryService,
  WorkAllocationService,
} from './services';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    PipesModule,
    MarkdownModule,
    FormsModule,
    ReactiveFormsModule,
    PaletteModule,
    ConditionalShowModule,
    LabelSubstitutorModule,
    ErrorsModule,
    ComplexModule,
  ],
  declarations: [
    CaseCreateComponent,
    CaseEditComponent,
    CaseEditConfirmComponent,
    CaseEditFormComponent,
    CaseEditPageComponent,
    CaseEditSubmitComponent,
    CaseProgressComponent
  ],
  exports: [
    CaseCreateComponent,
    CaseEditComponent,
    CaseEditConfirmComponent,
    CaseEditFormComponent,
    CaseEditPageComponent,
    CaseEditSubmitComponent,
    CaseProgressComponent,
    CallbackErrorsComponent
  ],
  providers: [
    FieldsUtils,
    FieldsPurger,
    ConditionalShowRegistrarService,
    WizardFactoryService,
    FieldTypeSanitiser,
    FormValueService,
    FormErrorService,
    PageValidationService,
    CaseFieldService,
    OrderService,
    EventTriggerService,
    ProfileService,
    ProfileNotifier,
    AddressesService,
    DocumentManagementService,
    RouterHelperService,
    ProfileService,
    CaseEditWizardGuard,
    UnsavedChangesGuard,
    WorkAllocationService
  ]
})
export class CaseEditorModule {}
