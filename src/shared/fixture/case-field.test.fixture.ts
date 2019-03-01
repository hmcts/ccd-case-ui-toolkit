import { FieldType } from '../domain/definition';
import { textFieldType } from '.';
import { CaseFieldBuilder } from './case-field-builder';

export let newCaseField = (id: string,
                           label: string,
                           hint: string,
                           fieldType: FieldType,
                           display_context: string,
                           order = undefined): CaseFieldBuilder => {
  return CaseFieldBuilder.create()
    .withId(id || 'personFirstName')
    .withFieldType(fieldType || textFieldType())
    .withDisplayContext(display_context || 'OPTIONAL')
    .withHintText(hint || 'First name hint text')
    .withLabel(label || 'First name')
    .withOrder(order)
    .withShowSummaryContentOption(0);
};
