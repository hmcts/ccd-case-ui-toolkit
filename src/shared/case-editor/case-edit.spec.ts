import { CaseField } from '../domain/definition/case-field.model';
import { ShowCondition } from '../conditional-show/conditional-show.model';
import { WizardPage } from '../domain/wizard-page.model';
import createSpyObj = jasmine.createSpyObj;
import { FieldTypeEnum } from '../domain/definition/field-type-enum.model';

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

export let aWizardPage = (pageId: string, label: string, order: number): WizardPage => {
  let wp = new WizardPage();
  wp.id = pageId;
  wp.label = label;
  wp.order = order;
  let parsedShowCondition = createSpyObj<ShowCondition>('parsedShowCondition', ['match']);
  parsedShowCondition.match.and.returnValue(true);
  wp.parsedShowCondition = parsedShowCondition;
  return wp;
};
