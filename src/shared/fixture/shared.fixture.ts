import { CaseField } from '../domain/definition/case-field.model';
import { CaseEventTrigger } from '../domain/case-view/case-event-trigger.model';
import { FieldTypeEnum, WizardPage } from '../domain';
import createSpyObj = jasmine.createSpyObj;
import { ShowCondition } from '../conditional-show';

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
  show_summary_content_option: number): CaseField => {
  return {
    id: id || 'personFirstName',
    field_type: {
      id: type.toString() || 'Text',
      type: type || 'Text'
    },
    display_context: display_context || 'OPTIONAL',
    label: label || 'First name',
    show_summary_content_option: show_summary_content_option
  };
};
