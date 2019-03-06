import { WizardPageField } from '../domain';
import { CaseField } from '../../../domain';
import { ComplexFieldOverride } from '../domain/wizard-page-field-complex-override.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WizardPageFieldToCaseFieldMapper {

  private HIDDEN = 'HIDDEN';

  mapAll(wizardPageFields: WizardPageField[], caseFields: CaseField[]): CaseField[] {
    return wizardPageFields.map(wizardField => this.map(wizardField, caseFields));
  }

  private map(wizardPageField: WizardPageField, caseFields: CaseField[]): CaseField {

    let caseField: CaseField = caseFields.find(e => e.id === wizardPageField.case_field_id);
    caseField.wizardProps = wizardPageField;
    caseField.display_context = wizardPageField.display_context;
    caseField.order = wizardPageField.order;

    if (wizardPageField.complex_field_overrides && wizardPageField.complex_field_overrides.length > 0) {
      wizardPageField.complex_field_overrides.forEach((override: ComplexFieldOverride) => {
        this.processComplexFieldOverride(override, caseField, caseFields);
      });
    }

    // this will fix the CaseLink type as we exclude it in ccdFieldsFilter directive
    this.hideParentIfAllChildrenHidden(caseField);

    return caseField;
  }

  private processComplexFieldOverride(override: ComplexFieldOverride, caseField: CaseField, caseFields: CaseField[]) {
    const caseFieldIds = override.complex_field_element_id.split('.');
    let caseFieldLeaf: CaseField = this.findCaseFieldToOverride(caseField, caseFieldIds, caseFields);

    if (override.display_context !== this.HIDDEN) {
      caseFieldLeaf.hidden = false;
      this.overrideCaseFieldData(caseFieldLeaf, override);
    } else {
      caseFieldLeaf.hidden = true;
    }
  }

  private findCaseFieldToOverride(caseField: CaseField, caseFieldIds, caseFields: CaseField[]) {
    if (this.isCollectionOfComplex(caseField)) {
      const [_, ...tail] = caseFieldIds;
      return this.getCaseFieldLeaf(tail, caseField.field_type.collection_field_type.complex_fields);
    } else {
      return this.getCaseFieldLeaf(caseFieldIds, caseFields);
    }
  }

  private overrideCaseFieldData(caseFieldLeaf: CaseField, override: ComplexFieldOverride) {
    caseFieldLeaf.display_context = override.display_context;
    if (override.order) {
      caseFieldLeaf.order = override.order;
    }
    if (override.label && override.label.length > 0) {
      caseFieldLeaf.label = override.label;
    }
    if (override.hint_text && override.hint_text.length > 0) {
      caseFieldLeaf.hint_text = override.hint_text;
    }
    if (override.show_condition && override.show_condition.length > 0) {
      caseFieldLeaf.show_condition = override.show_condition;
    }
  }

  private getCaseFieldLeaf(caseFieldId: string[], caseFields: CaseField[]): CaseField {
    const [head, ...tail] = caseFieldId;
    if (caseFieldId.length === 1) {
      let caseLeaf = caseFields.find(e => e.id === head);
      if (!caseLeaf) {
        throw new Error(`Cannot find overridden field for caseFieldId ${caseFieldId.join('.')}`);
      }
      return caseLeaf;
    } else if (caseFieldId.length > 1) {
      let caseField = caseFields.find(e => e.id === head);
      if (!caseField.field_type.complex_fields) {
        throw new Error(`field_type or complex_fields missing for ${caseFieldId.join('.')}`);
      }
      let newCaseFields = caseField.field_type.complex_fields;
      return this.getCaseFieldLeaf(tail, newCaseFields)
    } else {
      throw new Error(`Cannot find overridden field for caseFieldId ${caseFieldId.join('.')}`);
    }
  }

  private hideParentIfAllChildrenHidden(caseField: CaseField) {
    let children = [];
    if (this.isCollection(caseField)) {
      children = caseField.field_type.collection_field_type.complex_fields || [];
    } else if (this.isComplex(caseField)) {
      children = caseField.field_type.complex_fields || [];
    }

    children.forEach(e => this.hideParentIfAllChildrenHidden(e));

    if (children.length > 0 && this.allCaseFieldsHidden(children)) {
      caseField.hidden = true;
    }
  }

  private allCaseFieldsHidden(children: CaseField[]): boolean {
    return !children.some(e => e.hidden !== true);
  }

  private isCollectionOfComplex(caseField: CaseField) {
    return caseField.field_type.type === 'Collection' && caseField.field_type.collection_field_type.type === 'Complex';
  }

  private isComplex(caseField: CaseField) {
    return caseField.field_type.type === 'Complex';
  }

  private isCollection(caseField: CaseField) {
    return caseField.field_type.type === 'Collection';
  }
}
