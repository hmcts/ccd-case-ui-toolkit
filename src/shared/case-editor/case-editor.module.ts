import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CaseEditConfirmComponent } from './case-edit-confirm.component';
import { CaseEditComponent } from './case-edit.component';
import { CaseEditPageComponent } from './case-edit-page.component';
import { CaseEditFormComponent } from './case-edit-form.component';
import { CaseEditSubmitComponent } from './case-edit-submit.component';
import { FieldsUtils } from '../utils/fields.utils';
import { FieldsPurger } from '../utils/fields.purger';
import { ConditionalShowRegistrarService } from '../conditional-show/conditional-show-registrar.service';
import { WizardFactoryService } from './wizard-factory.service';
import { FormValueService } from '../form/form-value.service';
import { FormErrorService } from '../form/form-error.service';
import { PageValidationService } from './page-validation.service';
import { CaseFieldService } from '../domain/case-field.service';
import { OrderService } from '../domain/order/order.service';
import { SharedUtilsModule } from '../utils/shared-utils.module';
import { MarkdownModule } from '../markdown/markdown.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CallbackErrorsComponent } from '../error';
import { PaletteModule } from '../palette/palette.module';
import { LabelSubstitutorModule } from '../substitutor/label-substitutor.module';
import { ConditionalShowModule } from '../conditional-show/conditional-show.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        SharedUtilsModule,
        MarkdownModule,
        FormsModule,
        ReactiveFormsModule,
        PaletteModule,
        ConditionalShowModule,
        LabelSubstitutorModule,
    ],
    declarations: [
        CaseEditConfirmComponent,
        CaseEditComponent,
        CaseEditPageComponent,
        CaseEditFormComponent,
        CaseEditSubmitComponent,
        CallbackErrorsComponent,
    ],
    exports: [
        CaseEditConfirmComponent,
        CaseEditComponent,
        CaseEditPageComponent,
        CaseEditFormComponent,
        CaseEditSubmitComponent,
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
    ]
})
export class CaseEditorModule {}
