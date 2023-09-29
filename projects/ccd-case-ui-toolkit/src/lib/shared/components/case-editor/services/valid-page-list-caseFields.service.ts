import { Injectable } from '@angular/core';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { CaseField } from '../../../domain/definition';
import { ShowCondition } from '../../../directives/conditional-show/domain/conditional-show.model';
import { WizardPage } from '../../case-editor/domain/wizard-page.model';

@Injectable()
export class ValidPageListCaseFieldsService {
  public deleteNonValidatedFields(validPageList: WizardPage[], data: object, notFromEventSubmit: boolean, fromPreviousPage: boolean = false): void {
    const validPageListCaseFields: CaseField[] = [];
    validPageList.forEach(page => {
      if (notFromEventSubmit || ShowCondition.getInstance(page.show_condition).match(data)) {
        page.case_fields.forEach(field => validPageListCaseFields.push(field));
      }
    });

    if (!fromPreviousPage && validPageListCaseFields.length > 0) {
      Object.keys(data).forEach(key => {
        if (validPageListCaseFields.findIndex((element) => element.id === key) < 0) {
          delete data[key];;
        }
      });
    }
  }
}