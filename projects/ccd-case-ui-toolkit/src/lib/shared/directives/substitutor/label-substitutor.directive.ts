import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { CaseField } from '../../domain/definition/case-field.model';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { PlaceholderService } from './services/placeholder.service';
import { RpxTranslatePipe, RpxTranslationService } from 'rpx-xui-translation';
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
  @Input() public formGroup: FormGroup;
  @Input() public elementsToSubstitute: string[] = ['label', 'hint_text'];

  private initialLabel: string;
  private initialHintText: string;
  private languageSubscription: Subscription

  constructor(
    private readonly fieldsUtils: FieldsUtils,
    private readonly placeholderService: PlaceholderService,
    private readonly rpxTranslationPipe: RpxTranslatePipe,
    private readonly rpxTranslationService: RpxTranslationService
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

  private applySubstitutions(isLanguageChange = false): void {
    const fields: object = this.getReadOnlyAndFormFields();

    if (this.shouldSubstitute('label')) {
      this.applyLabelSubstitution(fields, isLanguageChange);
    }
    if (this.shouldSubstitute('hint_text')) {
      this.caseField.hint_text = this.resolvePlaceholders(fields, this.caseField.hint_text);
    }
    if (this.shouldSubstitute('value')) {
      this.caseField.value = this.resolvePlaceholders(fields, this.caseField.value);
    }
  }

  private applyLabelSubstitution(fields: object, isLanguageChange: boolean): void {
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
    this.applyTranslatedLabelState(fields, originalLabel, substitutedLabel, isLanguageChange);
  }

  private applyTranslatedLabelState(
    fields: object,
    originalLabel: string,
    substitutedLabel: string,
    isLanguageChange: boolean
  ): void {
    // Some labels only translate correctly if we translate the template first and then
    // substitute the helper values into the translated sentence.
    const translatedTemplateLabel = this.resolvePlaceholders(
      fields,
      isLanguageChange ? this.translateLabelOnLanguageChange(originalLabel) : this.translateLabel(originalLabel)
    );

    // Other labels only translate correctly if we first resolve the English phrase and let
    // the render layer translate that final resolved string.
    const translatedResolvedLabel = isLanguageChange
      ? this.translateLabelOnLanguageChange(substitutedLabel)
      : this.translateLabel(substitutedLabel);
    const languageIsWelsh = this.rpxTranslationService.language === 'cy';
    const hasResolvedWelshTranslation = languageIsWelsh
      && translatedResolvedLabel
      && translatedResolvedLabel !== substitutedLabel;
    const hasTemplateWelshTranslation = languageIsWelsh
      && translatedTemplateLabel
      && translatedTemplateLabel !== substitutedLabel;

    if (hasResolvedWelshTranslation) {
      // Keep the resolved English label and mark it as not yet translated so the field
      // template can run `rpxTranslate` on the full phrase at render time.
      this.setLabelState(substitutedLabel);
      return;
    }

    if (hasTemplateWelshTranslation) {
      // Use the template-translated result when translating the fully resolved label does
      // not improve the Welsh output.
      this.setLabelState(translatedTemplateLabel, true);
      return;
    }

    // English, untranslated Welsh, or labels whose translation is handled elsewhere.
    this.setLabelState(substitutedLabel);
  }

  private translateLabel(label: string): string {
    return this.rpxTranslationPipe.transform(label);
  }

  private translateLabelOnLanguageChange(label: string): string {
    return this.rpxTranslationService.language === 'en'
      ? label
      : this.translateLabel(label);
  }

  private setLabelState(label: string, isTranslated = false): void {
    this.caseField.label = label;
    this.caseField.isTranslated = isTranslated;
  }

  private onLanguageChange(): void {
    this.resetToInitialValues(true);
    this.applySubstitutions(true);
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
