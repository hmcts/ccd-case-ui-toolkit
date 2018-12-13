import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { PlaceholderService } from './services';

@Directive({ selector: '[ccdLabelSubstitutor]' })
/**
 * Checks all labels and substitutes any that reference other ones.
 */
export class LabelSubstitutorDirective implements OnInit, OnDestroy {

  @Input() caseField: CaseField;
  @Input() eventFields: CaseField[] = [];
  @Input() formGroup: FormGroup;

  initialLabel: string;
  initialHintText: string;

  constructor(private fieldsUtils: FieldsUtils, private placeholderService: PlaceholderService) {
  }

  ngOnInit() {
    this.initialLabel = this.caseField.label;
    this.initialHintText = this.caseField.hint_text;
    this.formGroup = this.formGroup || new FormGroup({});

    let fields = this.getReadOnlyAndFormFields();

    this.caseField.label = this.resolvePlaceholders(fields, this.caseField.label);
    this.caseField.hint_text = this.resolvePlaceholders(fields, this.caseField.hint_text);
    this.caseField.value = this.resolvePlaceholders(fields, this.caseField.value);
  }

  ngOnDestroy() {
    this.caseField.label = this.initialLabel;
    this.caseField.hint_text = this.initialHintText;
  }

  private getReadOnlyAndFormFields() {
    let formFields = this.getFormFieldsValuesIncludingDisabled();
    // TODO: Delete following line when @Input eventFields is fixed - https://tools.hmcts.net/jira/browse/RDM-3504
    let uniqueEventFields = this.removeDuplicates(this.eventFields);
    return this.fieldsUtils.mergeLabelCaseFieldsAndFormFields(uniqueEventFields, formFields);
  }

  private removeDuplicates(arr: CaseField[]) {
    let unique_array = [];
    arr.forEach(caseField => {
      if (unique_array.filter(e => e['id'] === caseField.id).length === 0 ) {
        unique_array.push(caseField);
      }
    });
    return unique_array
  }

  private getFormFieldsValuesIncludingDisabled() {
    return this.formGroup.getRawValue();
  }

  private resolvePlaceholders(fields, stringToResolve) {
    return this.placeholderService.resolvePlaceholders(fields, stringToResolve);
  }
}
