import { WizardPage } from './wizard-page.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { WizardPageField } from './wizard-page-field.model';

let createField = (colNumber: number): CaseField => {
  let field = new CaseField();
  let wizardProps = new WizardPageField();
  wizardProps.page_column_no = colNumber;
  field.wizardProps = wizardProps;
  return field;
}

describe('WizardPage', () => {

    it('isMultiColumn is false when only col1 fields', () => {
      let page = new WizardPage();
      let colNumber = 1
      page.case_fields = [createField(colNumber)];

      expect(page.isMultiColumn()).toBeFalsy();
    });

    it('isMultiColumn is true when col1 and col2 fields', () => {
      let page = new WizardPage();
      let colNumber = 2
      page.case_fields = [createField(colNumber)];

      expect(page.isMultiColumn()).toBeTruthy();
    });

    it('should return col1Fields', () => {
      let page = new WizardPage();
      let field = createField(1);
      let field2 = createField(undefined);
      let field3 = createField(2);
      page.case_fields = [field, field2, field3];

      expect(page.getCol1Fields()).toEqual([field, field2]);
      expect(page.getCol2Fields()).toEqual([field3]);

    });
});
