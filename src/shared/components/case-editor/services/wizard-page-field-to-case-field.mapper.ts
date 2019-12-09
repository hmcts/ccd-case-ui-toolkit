import { WizardPageField } from '../domain';
import { CaseField } from '../../../domain';
import { ComplexFieldOverride } from '../domain/wizard-page-field-complex-override.model';
import { Injectable } from '@angular/core';
import { ShowCondition } from '../../../directives/conditional-show/domain';

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

    let children = this.getCaseFieldChildren(caseField);

    if (children.length > 0) {
      const [_, ...tail] = caseFieldIds;
      case_field_leaf = this.getCaseFieldLeaf(tail, children);
    } else {
      case_field_leaf = this.getCaseFieldLeaf(caseFieldIds, caseFields);
    }

    if (override.display_context !== 'HIDDEN') {
      case_field_leaf.hidden = false;
      case_field_leaf.display_context = override.display_context;
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
      case_field_leaf.display_context = override.display_context;
    }
  }

  private fixShowConditionPath(caseField: CaseField, pathPrefix: string) {
    if (caseField.show_condition) {
      caseField.show_condition = ShowCondition.addPathPrefixToCondition(caseField.show_condition, pathPrefix);
    }

    let childrenCaseFields = this.getCaseFieldChildren(caseField);

    childrenCaseFields.forEach(collectionCaseField => {
      this.fixShowConditionPath(collectionCaseField, this.preparePathPrefix(pathPrefix, caseField.id));
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
      let children = this.getCaseFieldChildren(caseField);

      if (children.length === 0) {
        throw new Error(`field_type or complex_fields missing for ${caseFieldId.join('.')}`);
      }
      return this.getCaseFieldLeaf(tail, children)
    } else {
      throw new Error(`Cannot find leaf for caseFieldId ${caseFieldId.join('.')}`);
    }
  }

  private hideParentIfAllChildrenHidden(caseField: CaseField) {

    let childrenCaseFields = this.getCaseFieldChildren(caseField);

    childrenCaseFields.forEach(e => this.hideParentIfAllChildrenHidden(e));

    if (childrenCaseFields.length > 0 && this.allCaseFieldsHidden(childrenCaseFields)) {
      caseField.hidden = true;
    }
  }

  private getCaseFieldChildren(caseField: CaseField) {
    let childrenCaseFields = [];
    if (caseField.isCollection()) {
      childrenCaseFields = caseField.field_type.collection_field_type.complex_fields || [];
    } else if (caseField.isComplex()) {
      childrenCaseFields = caseField.field_type.complex_fields || [];
    }
    return childrenCaseFields;
  }

  private allCaseFieldsHidden(children: CaseField[]): boolean {
    return !children.some(e => e.hidden !== true);
  }
}
