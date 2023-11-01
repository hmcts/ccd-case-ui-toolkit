import { Injectable } from '@angular/core';
import { CaseField } from '../../../domain/definition';
import { WizardPage } from '../../case-editor/domain/wizard-page.model';
import { FieldsUtils } from '../../../services';

@Injectable()
export class ValidPageListCaseFieldsService {
  constructor(
    private readonly fieldsUtils: FieldsUtils
  ) {}

  private isShown(page: WizardPage, eventTriggerFields: CaseField[], data: object): boolean {
    const fields = this.fieldsUtils
      .mergeCaseFieldsAndFormFields(eventTriggerFields, data);
    return page.parsedShowCondition.match(fields);
  }

  public deleteNonValidatedFields(validPageList: WizardPage[], caseEventDatadata: object, eventTriggerFields: CaseField[],
                                  fromPreviousPage: boolean = false): void {
    const pageListCaseFields = this.validPageListCaseFields(validPageList, caseEventDatadata, eventTriggerFields);
    if (!fromPreviousPage && pageListCaseFields.length > 0) {
      Object.keys(caseEventDatadata).forEach(key => {
        if (pageListCaseFields.findIndex((element) => element.id === key) < 0) {
          delete caseEventDatadata[key];
        }
      });
    }
  }

  public validPageListCaseFields(validPageList: WizardPage[], data: object, eventTriggerFields: CaseField[]) : CaseField[] {
    const validPageListCaseFields: CaseField[] = [];
    validPageList.forEach(page => {
      if (this.isShown(page, eventTriggerFields, data)) {
        page.case_fields.forEach(field => validPageListCaseFields.push(field));
      }
    });
    return validPageListCaseFields;
  }
}
