import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CaseEditConfirmComponent } from './case-edit-confirm/case-edit-confirm.component';
import { CaseEditComponent } from './case-edit/case-edit.component';
import { CaseEditPageComponent } from './case-edit-page/case-edit-page.component';
import { CaseEditFormComponent } from './case-edit-form/case-edit-form.component';
import { CaseEditSubmitComponent } from './case-edit-submit/case-edit-submit.component';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { FieldsPurger } from '../../services/fields/fields.purger';
import { ConditionalShowRegistrarService } from '../../directives/conditional-show/services/conditional-show-registrar.service';
import { WizardFactoryService } from './services/wizard-factory.service';
import { FormValueService } from '../../services/form/form-value.service';
import { FormErrorService } from '../../services/form/form-error.service';
import { PageValidationService } from './services/page-validation.service';
import { CaseFieldService } from '../../services/case-fields/case-field.service';
import { OrderService } from '../../services/order/order.service';
import { PipesModule } from '../../pipes/pipes.module';
import { MarkdownModule } from '../../components/markdown/markdown.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CallbackErrorsComponent } from '../../components/error';
import { PaletteModule } from '../palette';
import { LabelSubstitutorModule } from '../../directives/substitutor';
import { ConditionalShowModule, GreyBarService } from '../../directives/conditional-show';
import { CaseCreateComponent } from './case-create/case-create.component';
import { CaseProgressComponent } from './case-progress/case-progress.component';
import { EventTriggerService } from './services/event-trigger.service';
import { ProfileService } from '../../services/profile/profile.service';
import { ProfileNotifier } from '../../services/profile';
import { AddressesService } from '../../services/addresses';
import { DocumentManagementService } from '../../services/document-management';
import { RouterHelperService } from '../../services/router';
import { CaseEditWizardGuard } from './services/case-edit-wizard.guard';
import { ErrorsModule } from '../error/errors.module';

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
    ]
})
export class CaseEditorModule {}
