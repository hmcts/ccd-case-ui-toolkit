import { WizardPageField } from '../domain';
import { CaseField } from '../../../domain';
import { ComplexFieldMask } from '../domain/wizard-page-field-complex-mask.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WizardPageFieldToCaseFieldMapper {

  mapAll(wizardPageField: WizardPageField[], caseFields: CaseField[]): CaseField[] {
    return wizardPageField.map((wizardField: WizardPageField) => {
      return this.map(wizardField, caseFields);
    });
  }

  private map(wizardPageField: WizardPageField, caseFields: CaseField[]): CaseField {

    let case_field: CaseField = caseFields.find(e => e.id === wizardPageField.case_field_id);
    case_field.id = wizardPageField.case_field_id;
    case_field.wizardProps = wizardPageField;
    case_field.display_context = wizardPageField.display_context;
    case_field.order = wizardPageField.order;

    if (wizardPageField.display_context === 'COMPLEX' && wizardPageField.complex_field_mask_list) {
      wizardPageField.complex_field_mask_list.forEach((complexFieldMask: ComplexFieldMask) => {
        this.processComplexFieldMask(complexFieldMask, case_field, caseFields);
      });
    }

    return case_field;
  }

  private processComplexFieldMask(complexFieldMask: ComplexFieldMask, case_field: CaseField, caseFields: CaseField[]) {
    const caseFieldIds = complexFieldMask.complex_field_id.split('.');
    let case_field_leaf: CaseField;

    if (case_field.field_type.type === 'Collection' && case_field.field_type.collection_field_type.type === 'Complex') {
      const [_, ...tail] = caseFieldIds;
      case_field_leaf = this.getCaseFieldLeaf(tail, case_field.field_type.collection_field_type.complex_fields);
    } else {
      case_field_leaf = this.getCaseFieldLeaf(caseFieldIds, caseFields);
    }

    if (complexFieldMask.display_context !== 'HIDDEN') {
      case_field_leaf.hidden = false;
      case_field_leaf.display_context = complexFieldMask.display_context;
      if (complexFieldMask.order) {
        case_field_leaf.order = complexFieldMask.order;
      }
      if (complexFieldMask.label && complexFieldMask.label.length > 0) {
        case_field_leaf.label = complexFieldMask.label;
      }
      if (complexFieldMask.hint_text && complexFieldMask.hint_text.length > 0) {
        case_field_leaf.hint_text = complexFieldMask.hint_text;
      }
      if (complexFieldMask.show_condition && complexFieldMask.show_condition.length > 0) {
        case_field_leaf.show_condition = complexFieldMask.show_condition;
      }
    } else {
      case_field_leaf.hidden = true;
    }
  }

  private getCaseFieldLeaf(caseFieldId: string[], caseFields: CaseField[]): CaseField {
    const [head, ...tail] = caseFieldId;
    if (caseFieldId.length === 1) {
      let caseLeaf = caseFields.find(e => e.id === head);
      if (!caseLeaf) {
        throw new Error(`Cannot find leaf for caseFieldId ${caseFieldId.join('.')}`);
      }
      return caseLeaf;
    } else if (caseFieldId.length > 1) {
      let caseField = caseFields.find(e => e.id === head);
      if (!caseField.field_type && !caseField.field_type.complex_fields) {
        throw new Error(`field_type or complex_fields missing for ${caseFieldId.join('.')}`);
      }
      let newCaseFields = caseField.field_type.complex_fields;
      return this.getCaseFieldLeaf(tail, newCaseFields)
    } else {
      throw new Error(`Cannot find leaf for caseFieldId ${caseFieldId.join('.')}`);
    }
  }
}
