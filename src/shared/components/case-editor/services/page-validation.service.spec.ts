import { async } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { PageValidationService } from './page-validation.service';
import { WizardPage } from '../domain/wizard-page.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { newCaseField } from '../../../fixture/case-field.test.fixture';
import { createFieldType } from '../../../fixture';

describe('PageValidationService', () => {

  let caseFieldService = new CaseFieldService();
  let service = new PageValidationService(caseFieldService);
  let wizardPage: WizardPage;
  let readOnly = new CaseField();
  let firstPage = new WizardPage();
  const FORM_GROUP = new FormGroup({
    'data': new FormGroup({ 'field1': new FormControl('SOME_VALUE') })
  });

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
    wizardPage.case_fields.push(newCaseField('fieldX', 'fieldX', null, null, 'OPTIONAL', null).build());
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should be invalid with empty document field when field is MANDATORY and not hidden', () => {
    let field1: CaseField = newCaseField('field1', 'field1', null, null, 'OPTIONAL', null).build();
    let field2: CaseField = newCaseField('field2', 'field2', null, createFieldType('Document', 'Document'), 'MANDATORY', null).build();
    field2.show_condition = 'field1="SOME_VALUE"';
    wizardPage.case_fields.push(field1, field2);
    wizardPage.isMultiColumn = () => false;

    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeFalsy();
  });

  it('should allow empty document fields when MANDATORY and field is hidden', () => {
    let field1: CaseField = newCaseField('field1', 'field1', null, null, 'OPTIONAL', null).build();
    let field2: CaseField = newCaseField('field2', 'field2', null, createFieldType('Document', 'Document'), 'MANDATORY', null).build();
    field2.show_condition = 'field1="SOME_OTHER_VALUE"';
    wizardPage.case_fields.push(field1, field2);
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should allow empty document fields when OPTIONAL and field is not hidden', () => {
    let field1: CaseField = newCaseField('Text', 'field1', null, null, 'OPTIONAL', null).build();
    let field2: CaseField = newCaseField('Document', 'field2', null, createFieldType('Document', 'Document'), 'OPTIONAL', null).build();
    field2.show_condition = 'field1="SOME_VALUE"';
    wizardPage.case_fields.push(field1, field2);
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should allow empty document fields when OPTIONAL and field is hidden', () => {
    let field1: CaseField = newCaseField('Text', 'field1', null, null, 'OPTIONAL', null).build();
    let field2: CaseField = newCaseField('Document', 'field2', null, createFieldType('Document', 'Document'), 'OPTIONAL', null).build();
    field2.show_condition = 'field1="SOME_OTHER_VALUE"';
    wizardPage.case_fields.push(field1, field2);
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should allow empty document fields when OPTIONAL', () => {
    wizardPage.case_fields.push(newCaseField('fieldX', 'fieldX', null, createFieldType('Document', 'Document'), 'OPTIONAL', null).build());
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should not allow empty document fields when MANDATORY', () => {
    wizardPage.case_fields.push(newCaseField('fieldX', 'fieldX', null, createFieldType('Document', 'Document'), 'MANDATORY', null).build());
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeFalsy();
  });
});
