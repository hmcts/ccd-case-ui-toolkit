import { WizardPageField } from '../domain';
import { CaseField } from '../../../domain';
import { ComplexFieldOverride } from '../domain/wizard-page-field-complex-override.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WizardPageFieldToCaseFieldMapper {

  mapAll(wizardPageFields: WizardPageField[], caseFields: CaseField[]): CaseField[] {
    return wizardPageFields.map(wizardField => {
      return this.map(wizardField, caseFields);
    });
  }

  private map(wizardPageField: WizardPageField, caseFields: CaseField[]): CaseField {

    let caseField: CaseField = caseFields.find(e => e.id === wizardPageField.case_field_id);
    caseField.id = wizardPageField.case_field_id;
    caseField.wizardProps = wizardPageField;
    caseField.display_context = wizardPageField.display_context;
    caseField.order = wizardPageField.order;

    if (wizardPageField.complex_field_overrides && wizardPageField.complex_field_overrides.length > 0) {
      wizardPageField.complex_field_overrides.forEach((override: ComplexFieldOverride) => {
        this.processComplexFieldOverride(override, caseField, caseFields);
      });
    }

    return caseField;
  }

  private processComplexFieldOverride(override: ComplexFieldOverride, case_field: CaseField, caseFields: CaseField[]) {
    const caseFieldIds = override.complex_field_element_id.split('.');
    let case_field_leaf: CaseField;

    if (this.isCollectionOfComplex(case_field)) {
      const [_, ...tail] = caseFieldIds;
      case_field_leaf = this.getCaseFieldLeaf(tail, case_field.field_type.collection_field_type.complex_fields);
    } else {
      case_field_leaf = this.getCaseFieldLeaf(caseFieldIds, caseFields);
    }

    if (override.display_context !== 'HIDDEN') {
      case_field_leaf.hidden = false;
      case_field_leaf.display_context = override.display_context;
      if (override.order) {
        case_field_leaf.order = override.order;
      }
      if (override.label && override.label.length > 0) {
        case_field_leaf.label = override.label;
      }
      if (override.hint_text && override.hint_text.length > 0) {
        case_field_leaf.hint_text = override.hint_text;
      }
      if (override.show_condition && override.show_condition.length > 0) {
        case_field_leaf.show_condition = override.show_condition;
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

  private isCollectionOfComplex(case_field: CaseField) {
    return case_field.field_type.type === 'Collection' && case_field.field_type.collection_field_type.type === 'Complex';
  }
}
