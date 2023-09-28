import { CaseField } from '../../../domain/definition';
import { ValidPageListCaseFieldsService } from './valid-page-list-caseFields.service';
import { WizardPage } from '../../case-editor/domain/wizard-page.model';

describe('ValidPageListCaseFieldsService', () => {
  let validPageListCaseFieldsService: ValidPageListCaseFieldsService;
  const PAGE_1: WizardPage = buildPage('page1', 'Page 1', 1, [
    buildCaseField('caseField8', 'someValue8'),
    buildCaseField('caseField9', 'someValue9'),
    buildCaseField('caseField10', 'someValue10')
  ]);
  const PAGE_2: WizardPage = buildPage('page2', 'Page 2', 2, [
    buildCaseField('caseField1', 'someValue1'),
    buildCaseField('caseField2', 'someValue2'),
    buildCaseField('caseField3', 'someValue3'),
    buildCaseField('caseField4', 'someValue4'),
    buildCaseField('caseField5', 'someValue5'),
  ]);

  const validPageList = [PAGE_1, PAGE_2];
  let caseEventData;
  beforeEach(() => {
    caseEventData = {
      caseField1: 'someValue1',
      caseField4: 'someValue4',
      caseField10: 'someValue10',
      caseField12: 'someValue12',
      caseField14: 'someValue14',
    };
    validPageListCaseFieldsService = new ValidPageListCaseFieldsService();
  });

  it('should return valid data from case submition after deleting non-valid fields', () => {
    validPageListCaseFieldsService.deleteNonValidatedFields(validPageList, caseEventData, true);
    expect(Object.keys(caseEventData).length).toBe(3);
  });

  it('should return valid data from EventJourney after deleting non-valid fields', () => {
    validPageListCaseFieldsService.deleteNonValidatedFields(validPageList, caseEventData, false);
    expect(Object.keys(caseEventData).length).toBe(3);
  });

  it('should return same data if fromPrevious argument set to true', () => {
    validPageListCaseFieldsService.deleteNonValidatedFields(validPageList, caseEventData, false, true);
    expect(Object.keys(caseEventData).length).toBe(5);
  });

  function buildPage(pageId: string, label: string, order: number, caseFields?: CaseField[]): WizardPage {
    const wp = new WizardPage();
    wp.id = pageId;
    wp.label = label;
    wp.order = order;
    wp.case_fields = caseFields;
    wp.show_condition = 'caseField1=\"someValue1\"';
    return wp;
  }

  function buildCaseField(caseFieldId: string, caseFieldValue: any) {
    const cField = new CaseField();
    cField.id = caseFieldId;
    cField.value = caseFieldValue;
    return cField;
  }
});