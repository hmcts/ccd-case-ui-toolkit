import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { CaseField } from '../../domain/definition/case-field.model';

/** Uses current form-control visibility and the configured retention policy. */
export class HiddenFieldValues {
  public static clearHiddenValues(data: any, control: AbstractControl, parentHidden = false, collectionItem = false): any {
    if (!control || data === null || data === undefined) {
      return data;
    }
    const field = (control as AbstractControl & { caseField?: CaseField }).caseField;
    const displayContext = field?.display_context?.toUpperCase();
    if (displayContext === 'READONLY' || displayContext === 'HIDDEN' ||
      displayContext === 'HIDDEN_TEMP' || field?.id === 'caseLinks') {
      return data;
    }

    const hidden = parentHidden || field?.hidden === true;
    if (hidden && field && !collectionItem) {
      if (!field.retain_hidden_value) {
        return control instanceof FormArray ? [] : null;
      }
      const hasComplexChildren = field.field_type?.type === 'Complex' ||
        (field.field_type?.type === 'Collection' && field.field_type.collection_field_type?.type === 'Complex');
      if (!hasComplexChildren) {
        // Documents, lists and other composite controls retain their whole value.
        return data;
      }
      // Complex children have their own retention settings; they do not inherit Yes.
    }

    if (control instanceof FormArray) {
      return this.clearCollectionValues(data, control, hidden);
    }
    if (control instanceof FormGroup) {
      const result = { ...data };
      Object.keys(result).forEach((key) => {
        result[key] = this.clearHiddenValues(result[key], control.controls[key], hidden);
      });
      return result;
    }
    return data;
  }

  private static clearCollectionValues(data: any, control: FormArray, hidden: boolean): any {
    if (!Array.isArray(data)) {
      return data;
    }
    return data.map((item, index) => {
      const row = control.at(index);
      const valueControl = row instanceof FormGroup ? row.controls.value : undefined;
      if (valueControl && item && typeof item === 'object' && Object.hasOwn(item, 'value')) {
        return {
          ...item,
          // The value group is a collection-item container, not another configurable case field.
          value: this.clearHiddenValues(item.value, valueControl, hidden, valueControl instanceof FormGroup)
        };
      }
      return this.clearHiddenValues(item, row, hidden);
    });
  }
}
