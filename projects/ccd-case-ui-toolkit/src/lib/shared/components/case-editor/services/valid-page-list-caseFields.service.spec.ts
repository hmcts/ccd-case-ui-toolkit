import { CaseField, FieldType } from '../../../domain';
import { ValidPageListCaseFieldsService } from './valid-page-list-caseFields.service';
import { WizardPage } from '../../case-editor/domain/wizard-page.model';
import { FieldsUtils } from '../../../services';
import { ShowCondition } from '../../../directives/conditional-show/domain';

describe('ValidPageListCaseFieldsService', () => {
  let validPageListCaseFieldsService: ValidPageListCaseFieldsService;
  const caseField1 = buildCaseField('caseField1', 'someValue1');
  const caseField2 = buildCaseField('caseField2', 'someValue2');
  const caseField3 = buildCaseField('caseField3', 'someValue3');
  const caseField4 = buildCaseField('caseField4', 'someValue4');
  const caseField5 = buildComplexCaseField('caseField5', 'someValue5');
  const caseField6 = buildCaseField('caseField6', 'someValue6');
  const caseField7 = buildCaseField('caseField7', 'someValue7');
  const caseField8 = buildCaseField('caseField8', 'someValue8');
  const caseField9 = buildCaseField('caseField9', 'someValue9');
  const caseField10 = buildCaseField('caseField10', 'someValue10');

  const PAGE_1: WizardPage = buildPage('page1', 'Page 1', 1, [caseField8, caseField9, caseField10]);
  const PAGE_2: WizardPage = buildPage('page2', 'Page 2', 2, [caseField1, caseField2, caseField3, caseField4, caseField5], 'caseField1=\"someValue1\"');
  const validPageList = [PAGE_1, PAGE_2];
  PAGE_1.parsedShowCondition = ShowCondition.getInstance(null);
  PAGE_2.parsedShowCondition = ShowCondition.getInstance('caseField1=\"someValue1\"');
  const fieldsUtils = new FieldsUtils();
  const eventTriggerFields = [caseField1, caseField2, caseField3, caseField4,
    caseField5, caseField6, caseField7, caseField8, caseField9, caseField10];
  const formFields = {
    caseField9 : 'someValue9',
    caseField10 : 'someValue10'
  }
  let caseEventData;
  const form = {
    controls: {
      data: {
        controls: {
          caseField5: {
            controls: {
              field1: {
                caseField: {
                  id: 'id1',
                  label: 'id1',
                  hidden: true,
                  retain_hidden_value: null,
                  value: 'val1'
                }
              },
              field2: {
                caseField: {
                  id: 'id2',
                  label: 'id2',
                  hidden: null,
                  retain_hidden_value: null,
                  value: 'val2'
                }
              }
            }
          }
        }
      }
    }
  }
  beforeEach(() => {
    caseEventData = {
      caseField1: 'someValue1',
      caseField4: 'someValue4',
      caseField10: 'someValue10',
      caseField12: 'someValue12',
      caseField14: 'someValue14',
    };
    validPageListCaseFieldsService = new ValidPageListCaseFieldsService(fieldsUtils);
  });

  it('should return valid data from case submition after deleting non-valid fields', () => {
    validPageListCaseFieldsService.deleteNonValidatedFields(validPageList, caseEventData, eventTriggerFields, false, formFields);
    expect(Object.keys(caseEventData).length).toBe(3);
  });

  it('should return valid data from EventJourney after deleting non-valid fields', () => {
    validPageListCaseFieldsService.deleteNonValidatedFields(validPageList, caseEventData, eventTriggerFields, false, formFields);
    expect(Object.keys(caseEventData).length).toBe(3);
  });

  it('should return same data if fromPrevious argument set to true', () => {
    validPageListCaseFieldsService.deleteNonValidatedFields(validPageList, caseEventData, eventTriggerFields, true, formFields);
    expect(Object.keys(caseEventData).length).toBe(5);
  });

  it('should return caseField list of valid page list', () => {
    const caseField = validPageListCaseFieldsService.validPageListCaseFields(validPageList, eventTriggerFields, formFields);
    expect(caseField.length).toBe(8);
  });

  it('should return caseField list of valid page list with hidden set to true and its marked as hidden', () => {
    const caseField = validPageListCaseFieldsService.validPageListCaseFields(validPageList, eventTriggerFields, formFields, form);
    const cf = caseField.filter(field => field.id === 'caseField5');
    expect(cf[0].field_type.complex_fields[0].hidden).toBe(true);
  });

  function buildPage(pageId: string, label: string, order: number, caseFields?: CaseField[], condition?: string): WizardPage {
    const wp = new WizardPage();
    wp.id = pageId;
    wp.label = label;
    wp.order = order;
    wp.case_fields = caseFields;
    wp.show_condition = condition;
    return wp;
  }

  function buildCaseField(caseFieldId: string, caseFieldValue: any) {
    const cField = new CaseField();
    cField.id = caseFieldId;
    cField.value = caseFieldValue;
    return cField;
  }

  function buildComplexCaseField(caseFieldId: string, caseFieldValue: any) {
    const cField = new CaseField();
    cField.id = caseFieldId;
    cField.value = caseFieldValue;
    cField.field_type = {
      id: 'ParentField',
      type: 'Complex',
      complex_fields: [
        {
          id: 'id1',
          label: 'id1',
          display_context: null,
          field_type: {
            id: 'Text',
            type: 'Text',
          },
          hidden: null,
          retain_hidden_value: null
        } as CaseField,
        {
          id: 'id2',
          label: 'id2',
          display_context: null,
          field_type: {
            id: 'Text',
            type: 'Text',
          },
          hidden: null,
          retain_hidden_value: null
        } as CaseField
      ]} as FieldType;
    return cField;
  }
});