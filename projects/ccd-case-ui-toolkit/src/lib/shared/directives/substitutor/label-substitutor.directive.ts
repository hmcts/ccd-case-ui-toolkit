import {ChangeDetectorRef, Directive, Input, OnDestroy, OnInit} from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { CaseField } from '../../domain/definition/case-field.model';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { PlaceholderService } from './services/placeholder.service';
import { RpxTranslationService } from 'rpx-xui-translation';
import { skip, Subscription } from 'rxjs';

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
  @Input() public formGroup: FormGroup | AbstractControl | undefined;
  @Input() public elementsToSubstitute: string[] = ['label', 'hint_text'];

  private initialLabel: string;
  private initialHintText: string;
  private languageSubscription: Subscription;
  private templateTranslationSubscription?: Subscription;

  constructor(
    private readonly fieldsUtils: FieldsUtils,
    private readonly placeholderService: PlaceholderService,
    private readonly rpxTranslationService: RpxTranslationService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.initialLabel = this.caseField.label;
    this.initialHintText = this.caseField.hint_text;
    this.noCacheProcessing();
    this.caseField.originalLabel = this.caseField.originalLabel || this.caseField.label;
    this.formGroup = this.formGroup || new FormGroup({});

    this.languageSubscription = this.rpxTranslationService.language$.pipe(
      skip(1)
    ).subscribe(() => {
      this.onLanguageChange();
    });

    this.applySubstitutions();
  }

  private noCacheProcessing() {
    // Pattern ensures [NOCACHE] is inside ${...} and has other content (field name)
    // Must have at least one character before or after [NOCACHE] inside the placeholder
    const placeholderPattern = /\$\{(?:[^}]*\[NOCACHE\][^}]+|[^}]+\[NOCACHE\][^}]*)\}/;

    if (this.caseField?.label && placeholderPattern.test(this.caseField.label)) {
      // Remove [NOCACHE] only when it appears inside ${...} placeholders
      // This regex matches ${...} and removes [NOCACHE] only within those patterns
      this.caseField.noCacheLabel = this.caseField.label.replace(/\$\{([^}]*)\[NOCACHE\]([^}]*)\}/g, '${$1$2}');
      this.caseField.label = this.caseField.noCacheLabel;
    } else if (this.caseField?.noCacheLabel) {
      if (this.formGroup !== undefined) {
        this.caseField.label = this.caseField?.noCacheLabel;
      }
    }
  }

  private applySubstitutions(): void {
    this.templateTranslationSubscription?.unsubscribe();
    const fields: object = this.getReadOnlyAndFormFields();
    this.caseField.translationHandledLocally = false;

    if (this.shouldSubstitute('label')) {
      this.applyLabelSubstitution(fields);
    }
    if (this.shouldSubstitute('hint_text')) {
      this.caseField.hint_text = this.resolvePlaceholders(fields, this.caseField.hint_text);
    }
    if (this.shouldSubstitute('value')) {
      this.caseField.value = this.resolvePlaceholders(fields, this.caseField.value);
    }
  }

  private applyLabelSubstitution(fields: object): void {
    const currentLabel = this.caseField.label;
    // `originalLabel` stores the label exactly as it came from the server, before any
    // placeholder values were inserted. That gives us a clean starting point when the user
    // changes language or returns to the page later.
    const originalLabel = this.caseField.originalLabel || currentLabel;
    const substitutedCurrentLabel = this.resolvePlaceholders(fields, currentLabel);
    const substitutedOriginalLabel = originalLabel === currentLabel
      ? substitutedCurrentLabel
      : this.resolvePlaceholders(fields, originalLabel);
    const substitutedLabel = substitutedCurrentLabel || substitutedOriginalLabel;
    const hasAnyLabelSubstitution = (currentLabel && currentLabel !== substitutedCurrentLabel)
      || (originalLabel && originalLabel !== substitutedOriginalLabel);

    if (!hasAnyLabelSubstitution) {
      // No placeholders were resolved, so keep the current label and allow the render layer
      // to translate it normally if needed.
      this.setLabelState(substitutedLabel);
      return;
    }

    // Preserve the original template the first time we successfully interpolate it.
    this.caseField.originalLabel = this.caseField.originalLabel || originalLabel;
    this.applyTranslatedLabelState(fields, originalLabel, substitutedLabel);
  }


  private applyTranslatedLabelState(
    fields: object,
    originalLabel: string,
    substitutedLabel: string
  ): void {

    // Interpolated content must be rendered without another translation request.
    this.caseField.translationHandledLocally = true;
    this.setLabelState(substitutedLabel, false);

    if (this.rpxTranslationService.language !== 'cy') {
      return;
    }

    this.templateTranslationSubscription = this.rpxTranslationService
      .getTranslation$(originalLabel)
      .subscribe((translatedTemplate) => {
        if (
          this.rpxTranslationService.language !== 'cy' ||
          !translatedTemplate ||
          translatedTemplate.includes('[Translation in progress]')
        ) {
          return;
        }

        // Initial English emissions and English fallbacks are not Welsh results.
        if (translatedTemplate.trim() === originalLabel.trim()) {
          this.setLabelState(substitutedLabel, false);
          this.cdr.markForCheck();
          return;
        }

        // Re-read values at emission time so delayed translations use the latest form/context values.
        const latestFields = this.getReadOnlyAndFormFields();
        const resolvedLabel =
          this.resolvePlaceholders(latestFields, translatedTemplate);

        // Keep usable existing content if the template cannot be resolved.
        if (resolvedLabel?.trim()) {
          this.setLabelState(
            resolvedLabel,
            resolvedLabel !== substitutedLabel
          );
        } else {
          this.setLabelState(substitutedLabel, false);
        }

        this.cdr.markForCheck();
      });
  }

  private setLabelState(label: string, isTranslated = false): void {
    this.caseField.label = label;
    this.caseField.isTranslated = isTranslated;
  }

  private onLanguageChange(): void {
    this.resetToInitialValues(true);
    this.applySubstitutions();
  }

  private resetToInitialValues(isLanguageChange = false): void {
    if (isLanguageChange && this.caseField?.originalLabel) {
      this.caseField.label = this.caseField.originalLabel;
    }
    if (!isLanguageChange && this.initialLabel) {
      this.caseField.label = this.initialLabel;
    }
    if (this.initialHintText) {
      this.caseField.hint_text = this.initialHintText;
    }

    // Check if isTranslated is a property on caseField before setting it
    if (this.caseField) {
      this.caseField.isTranslated = false;
      this.caseField.translationHandledLocally = false;
    }
  }

  public ngOnDestroy(): void {
    this.resetToInitialValues();
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    if (this.templateTranslationSubscription) {
      this.templateTranslationSubscription.unsubscribe();
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
