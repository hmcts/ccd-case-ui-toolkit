import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BannersModule } from '../../../components/banners/banners.module';
import { CallbackErrorsComponent } from '../../components/error';
import { ConditionalShowModule } from '../../directives/conditional-show';
import {
  ConditionalShowRegistrarService
} from '../../directives/conditional-show/services/conditional-show-registrar.service';
import { LabelSubstitutorModule } from '../../directives/substitutor/label-substitutor.module';
import { AddressesService } from '../../services/addresses';
import { CaseFieldService } from '../../services/case-fields/case-field.service';
import { FormatTranslatorService } from '../../services/case-fields/format-translator.service';
import { DocumentManagementService } from '../../services/document-management';
import { FieldsPurger } from '../../services/fields/fields.purger';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { FieldTypeSanitiser } from '../../services/form/field-type-sanitiser';
import { FormErrorService } from '../../services/form/form-error.service';
import { FormValueService } from '../../services/form/form-value.service';
import { HttpService } from '../../services/http/http.service';
import { OrderService } from '../../services/order/order.service';
import { ProfileNotifier } from '../../services/profile/profile.notifier';
import { ProfileService } from '../../services/profile/profile.service';
import { RouterHelperService } from '../../services/router';
import { SessionStorageService } from '../../services/session/session-storage.service';
import { ErrorsModule } from '../error/errors.module';
import { LoadingSpinnerModule } from '../loading-spinner/loading-spinner.module';
import { PaletteModule } from '../palette/palette.module';
import { CaseCreateComponent } from './case-create/case-create.component';
import { CaseEditConfirmComponent } from './case-edit-confirm/case-edit-confirm.component';
import { CaseEditFormComponent } from './case-edit-form/case-edit-form.component';
import { CaseEditPageComponent } from './case-edit-page/case-edit-page.component';
import { CaseEditSubmitComponent } from './case-edit-submit/case-edit-submit.component';
import { CaseEditComponent } from './case-edit/case-edit.component';
import {
  CaseEventCompletionComponent,
  CaseEventCompletionTaskCancelledComponent,
  CaseEventCompletionTaskReassignedComponent
} from './case-event-completion';
import { CaseProgressComponent } from './case-progress/case-progress.component';
import {
  CaseNotifier,
  EventCompletionStateMachineService,
  EventTriggerService,
  JudicialworkerService,
  PageValidationService,
  WizardFactoryService,
  WorkAllocationService
} from './services';
import { CaseEditWizardGuard } from './services/case-edit-wizard.guard';
import { CaseworkerService } from './services/case-worker.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PaletteModule,
    LabelSubstitutorModule,
    ConditionalShowModule,
    ErrorsModule,
    PortalModule,
    LoadingSpinnerModule,
    BannersModule
  ],
  declarations: [
    CaseEditConfirmComponent,
    CaseEditComponent,
    CaseEditPageComponent,
    CaseEditFormComponent,
    CaseEditSubmitComponent,
    CaseEventCompletionComponent,
    CaseEventCompletionTaskCancelledComponent,
    CaseEventCompletionTaskReassignedComponent,
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
    CallbackErrorsComponent
  ],
  providers: [
    CaseNotifier,
    FieldsUtils,
    FieldsPurger,
    ConditionalShowRegistrarService,
    WizardFactoryService,
    FieldTypeSanitiser,
    FormValueService,
    FormErrorService,
    FormatTranslatorService,
    HttpService,
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
    JudicialworkerService,
    CaseworkerService,
    SessionStorageService,
    EventCompletionStateMachineService
  ]
})
export class CaseEditorModule { }
