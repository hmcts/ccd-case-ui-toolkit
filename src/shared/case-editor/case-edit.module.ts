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
import { ConditionalShowRegistrarService } from '../conditional-show';
import { WizardFactoryService } from './wizard-factory.service';
import { FormValueService } from '../form/form-value.service';
import { FormErrorService } from '../form/form-error.service';
import { PageValidationService } from './page-validation.service';
import { CaseFieldService } from '../domain/case-field.service';
import { OrderService } from '../domain/order/order.service';

@NgModule({
    imports: [CommonModule, RouterModule],
    declarations: [CaseEditConfirmComponent, CaseEditComponent, CaseEditPageComponent, CaseEditFormComponent, CaseEditSubmitComponent],
    exports: [CaseEditConfirmComponent, CaseEditComponent, CaseEditPageComponent, CaseEditFormComponent, CaseEditSubmitComponent],
    providers: [FieldsUtils, FieldsPurger, ConditionalShowRegistrarService, WizardFactoryService, FormValueService, FormErrorService,
        PageValidationService, CaseFieldService, OrderService]
})
export class CaseEditModule {}
