import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CallbackErrorsComponent } from '../../components/error';
import { MarkdownModule } from '../../components/markdown/markdown.module';
import { ConditionalShowModule } from '../../directives/conditional-show';
import {
    ConditionalShowRegistrarService,
} from '../../directives/conditional-show/services/conditional-show-registrar.service';
import { LabelSubstitutorModule } from '../../directives/substitutor';
import { PipesModule } from '../../pipes/pipes.module';
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
import { CaseCreateComponent } from './case-create/case-create.component';
import { CaseEditConfirmComponent } from './case-edit-confirm/case-edit-confirm.component';
import { CaseEditFormComponent } from './case-edit-form/case-edit-form.component';
import { CaseEditPageComponent } from './case-edit-page/case-edit-page.component';
import { CaseEditSubmitComponent } from './case-edit-submit/case-edit-submit.component';
import { CaseEditComponent } from './case-edit/case-edit.component';
import { CaseProgressComponent } from './case-progress/case-progress.component';
import { CaseEditWizardGuard } from './services/case-edit-wizard.guard';
import { EventTriggerService } from './services/event-trigger.service';
import { PageValidationService } from './services/page-validation.service';
import { WizardFactoryService } from './services/wizard-factory.service';
import { WorkAllocationService } from './services/work-allocation.service';

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
        WorkAllocationService
    ]
})
export class CaseEditorModule {}
