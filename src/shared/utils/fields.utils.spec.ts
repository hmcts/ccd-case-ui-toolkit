import { CaseTab, CaseView } from '../domain/case-view';
import { FieldsUtils } from './fields.utils';
import { CaseField } from '../domain/definition';

describe('FieldsUtils', () => {

  let caseField1 = new CaseField();
  caseField1.id = 'field1';
  let caseField2 = new CaseField();
  caseField2.id = 'field2';
  let caseField3 = new CaseField();
  caseField3.id = 'field3';

  let caseTab1 = new CaseTab();
  caseTab1.fields = [caseField1];
  let caseTab2 = new CaseTab();
  caseTab2.fields = [caseField2];

  let caseView = new CaseView();
  caseView.tabs = [caseTab1, caseTab2];


  it('should return array of case data fields and metadata fields as case fields for given case view object', () => {
    caseView.metadataFields = [caseField3];
    expect(FieldsUtils.getCaseFields(caseView)).toEqual([caseField1, caseField2, caseField3]);
  });

});
