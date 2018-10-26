import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../domain/definition/case-field.model';
import { FieldsUtils } from '../utils/fields.utils';
import { LabelSubstitutionService } from '../case-editor';

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

  constructor(private fieldsUtils: FieldsUtils, private labelSubstitutionService: LabelSubstitutionService) {
  }

  ngOnInit() {
    if (this.caseField.label) {
      this.initialLabel = this.caseField.label;
      this.initialHintText = this.caseField.hint_text;
      this.formGroup = this.formGroup || new FormGroup({});

      let fields = this.getReadOnlyAndFormFields();
      this.caseField.label = this.substituteLabel(fields, this.caseField.label);
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
    return this.labelSubstitutionService.substituteLabel(fields, label);
  }

}
