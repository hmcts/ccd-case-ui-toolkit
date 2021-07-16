import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { CaseField } from '../../domain/definition/case-field.model';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { PlaceholderService } from './services';

@Directive({ selector: '[ccdLabelSubstitutor]' })
/**
 * Checks all labels and substitutes any placholders that reference other fields values.
 */
export class LabelSubstitutorDirective implements OnInit, OnDestroy {

  @Input() caseField: CaseField;
  @Input() contextFields: CaseField[] = [];
  @Input() formGroup: FormGroup;
  @Input() elementsToSubstitute: string[] = ['label', 'hint_text'];

  private initialLabel: string;
  private initialHintText: string;

  constructor(
    private readonly fieldsUtils: FieldsUtils,
    private readonly placeholderService: PlaceholderService
  ) {}

  public ngOnInit(): void {
    this.initialLabel = this.caseField.label;
    this.initialHintText = this.caseField.hint_text;
    this.formGroup = this.formGroup || new FormGroup({});

    const fields: object = this.getReadOnlyAndFormFields();

    if (this.shouldSubstitute('label')) {
      this.caseField.label = this.resolvePlaceholders(fields, this.caseField.label);
    }
    if (this.shouldSubstitute('hint_text')) {
      this.caseField.hint_text = this.resolvePlaceholders(fields, this.caseField.hint_text);
    }
    if (this.shouldSubstitute('value')) {
      this.caseField.value = this.resolvePlaceholders(fields, this.caseField.value);
    }
  }

  public ngOnDestroy(): void {
    this.caseField.label = this.initialLabel;
    this.caseField.hint_text = this.initialHintText;
  }

  private shouldSubstitute(element: string): boolean {
    return this.elementsToSubstitute.find(e => e === element) !== undefined;
  }

  private getReadOnlyAndFormFields(): object {
    const formFields: object = this.getFormFieldsValuesIncludingDisabled();
    // TODO: Delete following line when @Input contextFields is fixed - https://tools.hmcts.net/jira/browse/RDM-3504
    const uniqueContextFields: CaseField[] = this.removeDuplicates(this.contextFields);
    return this.fieldsUtils.mergeLabelCaseFieldsAndFormFields(uniqueContextFields, formFields);
  }

  private removeDuplicates(original: CaseField[]): CaseField[] {
    const unique: CaseField[] = [];
    original.forEach(caseField => {
      const isUnique = unique.filter(e => e.id === caseField.id).length === 0;
      if (isUnique) {
        unique.push(caseField);
      }
    });
    return unique;
  }

  private getFormFieldsValuesIncludingDisabled(): object {
    return this.formGroup.getRawValue();
  }

  private resolvePlaceholders(fields: object, stringToResolve: string): string {
    return this.placeholderService.resolvePlaceholders(fields, stringToResolve);
  }
}
