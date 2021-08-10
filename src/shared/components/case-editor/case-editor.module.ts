import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CallbackErrorsComponent } from '../../components/error';
import { MarkdownModule } from '../../components/markdown';
import { ConditionalShowModule, ConditionalShowRegistrarService, LabelSubstitutorModule } from '../../directives';
import { PipesModule } from '../../pipes/pipes.module';
import { SessionStorageService } from '../../services';
import { AddressesService } from '../../services/addresses';
import { CaseFieldService } from '../../services/case-fields/case-field.service';
import { DocumentManagementService } from '../../services/document-management';
import { FieldsPurger } from '../../services/fields/fields.purger';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { FieldTypeSanitiser } from '../../services/form';
import { FormErrorService } from '../../services/form/form-error.service';
import { FormValueService } from '../../services/form/form-value.service';
import { OrderService } from '../../services/order/order.service';
import { ProfileNotifier } from '../../services/profile';
import { ProfileService } from '../../services/profile/profile.service';
import { RouterHelperService } from '../../services/router';
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
      CaseEditWizardGuard,
      WorkAllocationService,
      UnsavedChangesGuard,
      SessionStorageService
  ]
})
export class CaseEditorModule {}
