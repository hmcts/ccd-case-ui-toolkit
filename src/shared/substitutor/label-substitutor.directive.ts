import { Directive, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../domain/definition/case-field.model';
import { FieldsUtils } from '../utils/fields.utils';
import { LabelSubstitutionService } from '../case-editor/label-substitution.service';

@Directive({ selector: '[ccdLabelSubstitutor]' })
/** Checks all labels and substitutes any that reference other ones.
*/
export class LabelSubstitutorDirective implements OnInit, OnDestroy {

  @Input() caseField: CaseField;
  @Input() eventFields: CaseField[] = [];
  @Input() formGroup: FormGroup = new FormGroup({});

  initialLabel: string;

  constructor(private fieldsUtils: FieldsUtils, private labelSubstitutionService: LabelSubstitutionService) { }

  ngOnInit() {
    this.initialLabel = this.getLabel();
    if (this.initialLabel) {
      this.formGroup = this.formGroup || new FormGroup({});
      // console.log('SubstitutorDirective FIELD: ' + this.caseField.id + ' init. Label: ' + this.caseField.label);
      // console.log('SubstitutorDirective EVENT_FIELDS: ', this.eventFields);
      this.setLabel(this.getResolvedLabel(this.getReadOnlyAndFormFields()));
    }
  }

  ngOnDestroy() {
    this.setLabel(this.initialLabel);
  }

  private getResolvedLabel(fields) {
    // console.log('SubstitutorDirective FIELD ' + this.caseField.id + ' updatingVisibility based on fields: ', fields);
    return this.labelSubstitutionService.substituteLabel(fields, this.getLabel());
    // console.log('SubstitutorDirective RESOLVED LABEL ', this.caseField.label);
  }

  private getReadOnlyAndFormFields() {
    let formFields = this.getFormFieldsValuesIncludingDisabled();
    // console.log('SubstitutorDirective FIELD ' + this.caseField.id + ' current form values including disabled: ', formFields);
    return this.fieldsUtils.mergeLabelCaseFieldsAndFormFields(this.eventFields, formFields);
  }

  private getFormFieldsValuesIncludingDisabled() {
    return this.formGroup.getRawValue();
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
