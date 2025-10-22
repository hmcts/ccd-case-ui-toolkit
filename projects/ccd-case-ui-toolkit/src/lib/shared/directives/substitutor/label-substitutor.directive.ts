import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { CaseField } from '../../domain/definition/case-field.model';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { PlaceholderService } from './services/placeholder.service';
import { RpxTranslatePipe, RpxTranslationService } from 'rpx-xui-translation';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[ccdLabelSubstitutor]',
  standalone: false
})
/**
 * Checks all labels and substitutes any placholders that reference other fields values.
 */
export class LabelSubstitutorDirective implements OnInit, OnDestroy {

  @Input() public caseField: CaseField;
  @Input() public contextFields: CaseField[] = [];
  @Input() public formGroup: FormGroup;
  @Input() public elementsToSubstitute: string[] = ['label', 'hint_text'];

  private initialHintText: string;
  private languageSubscription: Subscription

  constructor(
    private readonly fieldsUtils: FieldsUtils,
    private readonly placeholderService: PlaceholderService,
    private readonly rpxTranslationPipe: RpxTranslatePipe,
    private readonly rpxTranslationService: RpxTranslationService
  ) {}

  public ngOnInit(): void {
    this.initialHintText = this.caseField.hint_text;
    this.caseField.originalLabel = this.caseField.label;
    this.formGroup = this.formGroup || new FormGroup({});

    this.languageSubscription = this.rpxTranslationService.language$.subscribe(() => {
      // timeout is required to prevent race conditions with translation pipe
      setTimeout(() => {
        this.onLanguageChange();
      }, 100);
    });

    this.applySubstitutions()
  }

  private applySubstitutions(): void {
    const fields: object = this.getReadOnlyAndFormFields();

    if (this.shouldSubstitute('label')) {
      const oldLabel = this.caseField.label;
      const substitutedLabel = this.resolvePlaceholders(fields, this.caseField.label);
      if (oldLabel && oldLabel !== substitutedLabel) {
        // we need to translate the uninterpolated data then substitute the values in translated string
        this.caseField.originalLabel = substitutedLabel;
        const translated = this.rpxTranslationPipe.transform(oldLabel)
        const transSubstitutedLabel = this.resolvePlaceholders(fields, translated);
        this.caseField.label = transSubstitutedLabel;
        this.caseField.isTranslated = this.rpxTranslationService.language === 'cy' && translated !== oldLabel;
      } else {
        this.caseField.label = substitutedLabel;
        this.caseField.isTranslated = false;
      }
    }
    if (this.shouldSubstitute('hint_text')) {
      this.caseField.hint_text = this.resolvePlaceholders(fields, this.caseField.hint_text);
    }
    if (this.shouldSubstitute('value')) {
      this.caseField.value = this.resolvePlaceholders(fields, this.caseField.value);
    }
  }

  private onLanguageChange(): void {
    this.resetToInitialValues();
    this.applySubstitutions();
  }

  private resetToInitialValues(): void {
    if (this.caseField?.originalLabel) {
      this.caseField.label = this.caseField.originalLabel;
    }
    if (this.initialHintText) {
      this.caseField.hint_text = this.initialHintText;
    }

    // Check if isTranslated is a property on caseField before setting it
    if (this.caseField) {
      this.caseField.isTranslated = false;
    }
  }

  public ngOnDestroy(): void {
    this.resetToInitialValues();
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
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
