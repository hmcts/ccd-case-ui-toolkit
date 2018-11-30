import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { LabelSubstitutionService } from './services';

@Directive({ selector: '[ccdLabelSubstitutor]' })
/**
 * Checks all labels and substitutes any that reference other ones.
 */
export class LabelSubstitutorDirective implements OnInit, OnDestroy {

  @Input() caseField: CaseField;
  @Input() eventFields: CaseField[] = [];
  @Input() formGroup: FormGroup;
  @Input() isEmptyIfPlaceholderMissing: Boolean = false;

  initialLabel: string;
  initialHintText: string;

  constructor(private fieldsUtils: FieldsUtils, private labelSubstitutionService: LabelSubstitutionService) {
  }

  ngOnInit() {
    this.initialLabel = this.getLabel();
    if (this.initialLabel) {
      this.initialLabel = this.caseField.label;
      this.initialHintText = this.caseField.hint_text;
      this.formGroup = this.formGroup || new FormGroup({});

      let fields = this.getReadOnlyAndFormFields();
      this.setLabel(this.substituteLabel(fields, this.getLabel()));
      this.caseField.hint_text = this.substituteLabel(fields, this.caseField.hint_text);
    }
  }

  ngOnDestroy() {
    this.caseField.label = this.initialLabel;
    this.caseField.hint_text = this.initialHintText;
  }

  private getReadOnlyAndFormFields() {
    let formFields = this.getFormFieldsValuesIncludingDisabled();
    return this.fieldsUtils.mergeLabelCaseFieldsAndFormFields(this.eventFields, formFields);
  }

  private getFormFieldsValuesIncludingDisabled() {
    return this.formGroup.getRawValue();
  }

  private substituteLabel(fields, label) {
    return this.labelSubstitutionService.substituteLabel(fields, label, this.isEmptyIfPlaceholderMissing);
  }

  private getLabel() {
    return this.caseField.value || this.caseField.label;
  }
  private setLabel(label: string) {
    if (this.caseField.value) {
      this.caseField.value = label;
    } else {
      this.caseField.label = label;
    }
  }
}
