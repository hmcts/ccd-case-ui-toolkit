import { async } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PageValidationService } from './page-validation.service';
import { WizardPage } from '../domain/wizard-page.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { aCaseField } from '../../../fixture/shared.test.fixture';

describe('PageValidationService', () => {

  let caseFieldService = new CaseFieldService();
  let service = new PageValidationService(caseFieldService);
  let wizardPage: WizardPage;
  let readOnly = new CaseField();
  let firstPage = new WizardPage();
  const FORM_GROUP = new FormGroup({
    'data': new FormGroup({'field1': new FormControl('SOME_VALUE')})
  });

  const radioButtonCaseField = aCaseField('radioButton', 'Please select yes or no', 'YesOrNo', 'YesOrNo', null, [])
  const nestedComplex = aCaseField('nestedComplex', 'This is  a nested complex type', 'Complex', null, null, [
    aCaseField('text', 'Some text here', 'Text', 'MANDATORY', null, []),
    aCaseField('textArea', 'More text!', 'TextArea', 'MANDATORY', null, [], 'mandatoryHiddenField.radioButton="Yes"'),
  ])

  const nestedWizardPage = new WizardPage();
  nestedWizardPage.case_fields = [aCaseField('mandatoryHiddenField',
    'Test complex type with mandatory hidden field',
    'Complex',
    'Complex',
    null,
    [radioButtonCaseField, nestedComplex]
  )]

  beforeEach(async(() => {
    firstPage.id = 'first page';
    service = new PageValidationService(caseFieldService);
  }));

  beforeEach(() => {
    readOnly.display_context = 'READONLY';
    const FIELDS: CaseField[] = [readOnly];
    wizardPage = new WizardPage();
    wizardPage.case_fields = FIELDS;
    wizardPage.label = 'Test Label';
  });

  it('should allow empty values when field is OPTIONAL', () => {
    wizardPage.case_fields.push(aCaseField('fieldX', 'fieldX', 'Text', 'OPTIONAL', null));
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should be invalid with empty document field when field is MANDATORY and not hidden', () => {
    let field1 = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
    let field2 = aCaseField('field2', 'field2', 'Document', 'MANDATORY', null);
    field2.show_condition = 'field1="SOME_VALUE"';
    wizardPage.case_fields.push(field1, field2);
    wizardPage.isMultiColumn = () => false;

    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeFalsy();
  });

  it('should allow empty document fields when MANDATORY and field is hidden', () => {
    let field1 = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
    let field2 = aCaseField('field2', 'field2', 'Document', 'MANDATORY', null);
    field2.show_condition = 'field1="SOME_OTHER_VALUE"';
    wizardPage.case_fields.push(field1, field2);
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should allow empty document fields when OPTIONAL and field is not hidden', () => {
    let field1 = aCaseField('Text', 'field1', 'Text', 'OPTIONAL', null);
    let field2 = aCaseField('Document', 'field2', 'Document', 'OPTIONAL', null);
    field2.show_condition = 'field1="SOME_VALUE"';
    wizardPage.case_fields.push(field1, field2);
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should allow empty document fields when OPTIONAL and field is hidden', () => {
    let field1 = aCaseField('Text', 'field1', 'Text', 'OPTIONAL', null);
    let field2 = aCaseField('Document', 'field2', 'Document', 'OPTIONAL', null);
    field2.show_condition = 'field1="SOME_OTHER_VALUE"';
    wizardPage.case_fields.push(field1, field2);
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should allow empty document fields when OPTIONAL', () => {
    wizardPage.case_fields.push(aCaseField('fieldX', 'fieldX', 'Document', 'OPTIONAL', null));
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should not allow empty document fields when MANDATORY', () => {
    wizardPage.case_fields.push(aCaseField('fieldX', 'fieldX', 'Document', 'MANDATORY', null));
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeFalsy();
  });

  it('should set the page to be valid if there is a hidden complex type', () => {
    const NESTED_FORM_GROUP = new FormGroup({
      data: new FormGroup({
        mandatoryHiddenField: new FormGroup({
          radioButton: new FormControl('No', [Validators.required]),
          nestedComplex: new FormGroup({
            text: new FormControl({value: null, disabled: true}, [Validators.required]),
            textArea: new FormControl({value: null, disabled: true}, [Validators.required])
          })
        })
      })
    })
    expect(service.isPageValid(nestedWizardPage, NESTED_FORM_GROUP)).toBeTruthy();
  })

  it('should set the page not valid if there is a hidden complex type but the show_condition is meet', () => {
    const NESTED_FORM_GROUP = new FormGroup({
      data: new FormGroup({
        mandatoryHiddenField: new FormGroup({
          radioButton: new FormControl('Yes', [Validators.required]),
          nestedComplex: new FormGroup({
            text: new FormControl(null, [Validators.required]),
            textArea: new FormControl(null, [Validators.required])
          })
        })
      })
    })

    expect(service.isPageValid(nestedWizardPage, NESTED_FORM_GROUP)).toBeFalsy();

  })

  it('should set the page valid if there is a hidden complex type but the show_condition is meet and the values are populated', () => {
    const NESTED_FORM_GROUP = new FormGroup({
      data: new FormGroup({
        mandatoryHiddenField: new FormGroup({
          radioButton: new FormControl('Yes', [Validators.required]),
          nestedComplex: new FormGroup({
            text: new FormControl('Some text', [Validators.required]),
            textArea: new FormControl('Some text', [Validators.required])
          })
        })
      })
    })

    expect(service.isPageValid(nestedWizardPage, NESTED_FORM_GROUP)).toBeTruthy();

  })
});
