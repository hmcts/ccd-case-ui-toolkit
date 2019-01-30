import { CaseField } from '../domain/definition/case-field.model';
import { CaseEventTrigger } from '../domain/case-view/case-event-trigger.model';
import { FieldType, FieldTypeEnum } from '../domain';
import { ComplexFieldMask } from '../components/case-editor/domain/wizard-page-field-complex-mask.model';
import { WizardPage, WizardPageField } from '../components/case-editor/domain';
import { ShowCondition } from '../directives/conditional-show/domain';

export let createCaseEventTrigger = (id: string,
                                      name: string,
                                      case_id: string,
                                      show_summary: boolean,
                                      case_fields: CaseField[],
                                      wizard_pages = [],
                                      can_save_draft = false) => {
  const eventTrigger = new CaseEventTrigger();

  eventTrigger.id = id;
  eventTrigger.name = name;
  eventTrigger.case_id = case_id;
  eventTrigger.show_summary = show_summary;
  eventTrigger.wizard_pages = wizard_pages;
  eventTrigger.event_token = 'test-token';
  eventTrigger.case_fields = case_fields;
  eventTrigger.can_save_draft = can_save_draft;
  return eventTrigger;
};

export let aCaseField = (id: string, label: string, type: FieldTypeEnum, display_context: string,
  show_summary_content_option: number, typeComplexFields: CaseField[] = []): CaseField => {
  return {
    id: id || 'personFirstName',
    field_type: {
      id: type.toString() || 'Text',
      type: type || 'Text',
      complex_fields: typeComplexFields || []
    },
    display_context: display_context || 'OPTIONAL',
    label: label || 'First name',
    show_summary_content_option: show_summary_content_option
  };
};

export let createWizardPage = (id: string,
                               label: string,
                               order: number,
                               wizardPageFields: WizardPageField[] = [],
                               caseFields: CaseField[] = [],
                               showCondition: string,
                               parsedShowCondition: ShowCondition = null): WizardPage => {
  const wizardPage = new WizardPage();
  wizardPage.id = id;
  wizardPage.label = label;
  wizardPage.order = order;
  wizardPage.wizard_page_fields = wizardPageFields;
  wizardPage.case_fields = caseFields;
  wizardPage.show_condition = showCondition;
  wizardPage.parsedShowCondition = parsedShowCondition;
  return wizardPage;
};

export let createWizardPageField = (id: string,
                                    order: number,
                                    pageColumnNumber: number,
                                    displayContext: string,
                                    complexFieldMaskList: ComplexFieldMask[] = []): WizardPageField => {
  const wizardPageField = new WizardPageField();
  wizardPageField.case_field_id = id;
  wizardPageField.order = order;
  wizardPageField.page_column_no = pageColumnNumber;
  wizardPageField.display_context = displayContext;
  wizardPageField.complex_field_mask_list = complexFieldMaskList;
  return wizardPageField;
};

export let createComplexFieldMask = (id: string,
                                     order: number,
                                     displayContext: string,
                                     label: string,
                                     hint: string,
                                     showCondition: string): ComplexFieldMask => {
  const complexFieldMask = new ComplexFieldMask();
  complexFieldMask.complex_field_id = id;
  complexFieldMask.order = order;
  complexFieldMask.display_context = displayContext;
  complexFieldMask.label = label;
  complexFieldMask.hint_text = hint;
  complexFieldMask.show_condition = showCondition;
  return complexFieldMask;
};

export let createHiddenComplexFieldMask = (id: string): ComplexFieldMask => {
  const complexFieldMask = new ComplexFieldMask();
  complexFieldMask.complex_field_id = id;
  complexFieldMask.display_context = 'HIDDEN';
  return complexFieldMask;
};

export let createCaseField = (id: string, label: string, hint: string, fieldType: FieldType, display_context: string): CaseField => {
  return {
    id: id || 'personFirstName',
    field_type: fieldType || textFieldType(),
    display_context: display_context || 'OPTIONAL',
    label: label || 'First name',
    hint_text: hint || 'First name hint text',
    show_summary_content_option: 0,
  };
};

export let createFieldType = (typeId: string, type: FieldTypeEnum, complex_fields: CaseField[] = []): FieldType => {
  return {
    id: typeId || 'Text',
    type: type || 'Text',
    complex_fields: complex_fields || []
  };
};

export let textFieldType = (): FieldType => {
  return {
    id: 'Text',
    type: 'Text',
    complex_fields: []
  };
};
