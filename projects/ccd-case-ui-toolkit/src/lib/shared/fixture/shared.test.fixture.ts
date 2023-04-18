import { ComplexFieldOverride } from '../components/case-editor/domain/wizard-page-field-complex-override.model';
import { WizardPageField } from '../components/case-editor/domain/wizard-page-field.model';
import { WizardPage } from '../components/case-editor/domain/wizard-page.model';
import { ShowCondition } from '../directives/conditional-show/domain/conditional-show.model';
import { CaseEventTrigger } from '../domain/case-view/case-event-trigger.model';
import { AccessControlList } from '../domain/definition/access-control-list.model';
import { CaseField } from '../domain/definition/case-field.model';
import { FieldTypeEnum } from '../domain/definition/field-type-enum.model';
import { FieldType } from '../domain/definition/field-type.model';
import { FixedListItem } from '../domain/definition/fixed-list-item.model';
import { CaseFieldBuilder } from './case-field-builder';

export const textFieldType = (): FieldType => {
  return {
    id: 'Text',
    type: 'Text',
    complex_fields: []
  };
};

export const createCaseEventTrigger = (id: string,
                                       name: string,
                                       caseId: string,
                                       showSummary: boolean,
                                       caseFields: CaseField[],
                                       wizardPages = [],
                                       canSaveDraft = false): CaseEventTrigger => {
  const eventTrigger = new CaseEventTrigger();

  eventTrigger.id = id;
  eventTrigger.name = name;
  eventTrigger.case_id = caseId;
  eventTrigger.show_summary = showSummary;
  eventTrigger.wizard_pages = wizardPages;
  eventTrigger.event_token = 'test-token';
  eventTrigger.case_fields = caseFields;
  eventTrigger.can_save_draft = canSaveDraft;
  return eventTrigger;
};

export const aCaseField = (id: string,
                           label: string,
                           type: FieldTypeEnum,
                           displayContext: string,
                           showSummaryContentOption: number,
                           typeComplexFields: CaseField[] = [],
                           retainHiddenValue?: boolean,
                           hidden?: boolean): CaseField => {
  return ({
    id: id || 'personFirstName',
    field_type: {
      id: type.toString() || 'Text',
      type: type || 'Text',
      complex_fields: typeComplexFields || []
    },
    display_context: displayContext || 'OPTIONAL',
    label: label || 'First name',
    show_summary_content_option: showSummaryContentOption,
    retain_hidden_value: retainHiddenValue || false,
    hidden: hidden || false
  }) as CaseField;
};

export const createWizardPage = (id: string,
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

export const createWizardPageField = (id: string,
                                      order: number,
                                      pageColumnNumber: number,
                                      complexFieldOverrides: ComplexFieldOverride[] = []): WizardPageField => {
  const wizardPageField = new WizardPageField();
  wizardPageField.case_field_id = id;
  wizardPageField.order = order;
  wizardPageField.page_column_no = pageColumnNumber;
  wizardPageField.complex_field_overrides = complexFieldOverrides;
  return wizardPageField;
};

export const createComplexFieldOverride = (id: string,
                                           order: number,
                                           displayContext: string,
                                           label: string,
                                           hint: string,
                                           showCondition: string): ComplexFieldOverride => {
  const complexFieldOverride = new ComplexFieldOverride();
  complexFieldOverride.complex_field_element_id = id;
  complexFieldOverride.display_context = displayContext;
  complexFieldOverride.label = label;
  complexFieldOverride.hint_text = hint;
  complexFieldOverride.show_condition = showCondition;
  return complexFieldOverride;
};

export const createHiddenComplexFieldOverride = (id: string): ComplexFieldOverride => {
  const complexFieldOverride = new ComplexFieldOverride();
  complexFieldOverride.complex_field_element_id = id;
  complexFieldOverride.display_context = 'HIDDEN';
  return complexFieldOverride;
};

export const createCaseField = (id: string,
                                label: string,
                                hint: string,
                                fieldType: FieldType,
                                displayContext: string,
                                order = undefined,
                                showCondition = undefined,
                                acls: AccessControlList[] = undefined,
                                hidden?: boolean): CaseField => {
  return CaseFieldBuilder.create()
    .withId(id || 'personFirstName')
    .withFieldType(fieldType || textFieldType())
    .withDisplayContext(displayContext || 'OPTIONAL')
    .withLabel(label || 'First name')
    .withHintText(hint || 'First name hint text')
    .withShowSummaryContentOption(0)
    .withOrder(order)
    .withShowCondition(showCondition || undefined)
    .withACLs(acls)
    .withHidden(hidden || false)
    .build();
};

export const newCaseField = (id: string,
                             label: string,
                             hint: string,
                             fieldType: FieldType,
                             displayContext: string,
                             order = undefined): CaseFieldBuilder => {
  return CaseFieldBuilder.create()
    .withId(id || 'personFirstName')
    .withFieldType(fieldType || textFieldType())
    .withDisplayContext(displayContext || 'OPTIONAL')
    .withHintText(hint || 'First name hint text')
    .withLabel(label || 'First name')
    .withOrder(order)
    .withShowSummaryContentOption(0);
};

export const createFieldType = (typeId: string,
                                type: FieldTypeEnum,
                                complexFields: CaseField[] = [],
                                collectionFieldType: FieldType = undefined): FieldType => {
  return {
    id: typeId || 'Text',
    type: type || 'Text',
    complex_fields: complexFields || [],
    collection_field_type: collectionFieldType || undefined
  };
};

export const createFixedListFieldType = (typeId: string,
                                         fixedListItems: FixedListItem[] = []): FieldType => {
  return {
    id: `FixedList-${typeId}`,
    type: 'FixedList',
    fixed_list_items: fixedListItems || []
  };
};

export const createMultiSelectListFieldType = (typeId: string,
                                               fixedListItems: FixedListItem[] = []): FieldType => {
  return {
    id: `MultiSelectList-${typeId}`,
    type: 'MultiSelectList',
    fixed_list_items: fixedListItems || []
  };
};

export const createACL = (role: string,
                          aclCreate: boolean,
                          aclRead: boolean,
                          aclUpdate: boolean,
                          aclDelete: boolean): AccessControlList => {
  return ({
    role: role || 'roleX',
    create: aclCreate,
    read: aclRead,
    update: aclUpdate,
    delete: aclDelete
  }) as AccessControlList;
};
