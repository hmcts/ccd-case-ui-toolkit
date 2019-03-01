import { CaseField } from '../domain/definition/case-field.model';
import { CaseEventTrigger } from '../domain/case-view/case-event-trigger.model';
import { FieldType, FieldTypeEnum } from '../domain';
import { ComplexFieldOverride } from '../components/case-editor/domain/wizard-page-field-complex-override.model';
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
                                    complexFieldOverrides: ComplexFieldOverride[] = []): WizardPageField => {
  const wizardPageField = new WizardPageField();
  wizardPageField.case_field_id = id;
  wizardPageField.order = order;
  wizardPageField.page_column_no = pageColumnNumber;
  wizardPageField.display_context = displayContext;
  wizardPageField.complex_field_overrides = complexFieldOverrides;
  return wizardPageField;
};

export let createComplexFieldOverride = (id: string,
                                         order: number,
                                         displayContext: string,
                                         label: string,
                                         hint: string,
                                         showCondition: string): ComplexFieldOverride => {
  const complexFieldOverride = new ComplexFieldOverride();
  complexFieldOverride.complex_field_element_id = id;
  complexFieldOverride.order = order;
  complexFieldOverride.display_context = displayContext;
  complexFieldOverride.label = label;
  complexFieldOverride.hint_text = hint;
  complexFieldOverride.show_condition = showCondition;
  return complexFieldOverride;
};

export let createHiddenComplexFieldOverride = (id: string): ComplexFieldOverride => {
  const complexFieldOverride = new ComplexFieldOverride();
  complexFieldOverride.complex_field_element_id = id;
  complexFieldOverride.display_context = 'HIDDEN';
  return complexFieldOverride;
};

export let createFieldType = (typeId: string,
                              type: FieldTypeEnum,
                              complex_fields: CaseField[] = [],
                              collection_field_type: FieldType = undefined): FieldType => {
  return Object.assign(new FieldType(), {
    id: typeId || 'Text',
    type: type || 'Text',
    complex_fields: complex_fields || [],
    collection_field_type: collection_field_type || undefined
  });
};

export let textFieldType = (): FieldType => {
  return Object.assign(new FieldType(), {
    id: 'Text',
    type: 'Text',
    complex_fields: []
  });
};
