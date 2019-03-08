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
    caseField.wizardProps = wizardPageField;
    caseField.display_context = wizardPageField.display_context;
    caseField.order = wizardPageField.order;

    this.fixShowConditionPath(caseField, '');

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
    let case_field_leaf: CaseField;

    if (this.isCollectionOfComplex(caseField)) {
      const [_, ...tail] = caseFieldIds;
      case_field_leaf = this.getCaseFieldLeaf(tail, caseField.field_type.collection_field_type.complex_fields);
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

  private fixShowConditionPath(caseField: CaseField, pathPrefix: string) {
    if (caseField.show_condition && pathPrefix.length > 0 && !caseField.show_condition.startsWith(pathPrefix)) {
      caseField.show_condition = pathPrefix.length > 0 ? pathPrefix + '.' + caseField.show_condition : caseField.show_condition;
    }

    let childrenCaseFields = [];
    if (this.isCollection(caseField)) {
      childrenCaseFields = caseField.field_type.collection_field_type.complex_fields || [];
    } else if (this.isComplex(caseField)) {
      childrenCaseFields = caseField.field_type.complex_fields || [];
    }

    childrenCaseFields.forEach(collectionCaseField => {
      if (collectionCaseField.show_condition) {
        console.log('showCondition before', collectionCaseField.show_condition);
      }
      this.fixShowConditionPath(collectionCaseField, this.preparePathPrefix(pathPrefix, caseField.id));
      if (collectionCaseField.show_condition) {
        console.log('showCondition after', collectionCaseField.show_condition);
      }
    });
  }

  private preparePathPrefix(pathPrefix: string, caseField: string) {
    return pathPrefix.length === 0 ? caseField : pathPrefix + '.' + caseField;
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

  private isCollectionOfComplex(case_field: CaseField) {
    return case_field.field_type.type === 'Collection' && case_field.field_type.collection_field_type.type === 'Complex';
  }

  private isComplex(case_field: CaseField) {
    return case_field.field_type.type === 'Complex';
  }

  private isCollection(case_field: CaseField) {
    return case_field.field_type.type === 'Collection';
  }
}
