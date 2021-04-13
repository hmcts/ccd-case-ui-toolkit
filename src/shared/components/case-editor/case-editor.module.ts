import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  CaseCreateComponent,
  CaseEditComponent,
  CaseEditConfirmComponent,
  CaseEditFormComponent,
  CaseEditPageComponent,
  CaseEditSubmitComponent,
  CaseProgressComponent,
} from '.';
import { CallbackErrorsComponent, MarkdownModule } from '../../components';
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
        CaseEditConfirmComponent,
        CaseEditComponent,
        CaseEditPageComponent,
        CaseEditFormComponent,
        CaseEditSubmitComponent,
        CaseCreateComponent,
        CaseProgressComponent
    ],
    exports: [
        CaseEditConfirmComponent,
        CaseEditComponent,
        CaseEditPageComponent,
        CaseEditFormComponent,
        CaseEditSubmitComponent,
        CaseCreateComponent,
        CaseProgressComponent,
        CallbackErrorsComponent,
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
        WorkAllocationService,
        UnsavedChangesGuard
    ]
})
export class CaseEditorModule {}
