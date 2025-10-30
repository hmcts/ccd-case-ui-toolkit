import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { Constants } from '../../commons/constants';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldTypeEnum } from '../../domain/definition/field-type-enum.model';

@Injectable()
export class FormValidatorsService {
  private static readonly CUSTOM_VALIDATED_TYPES: FieldTypeEnum[] = [
    'Date', 'MoneyGBP', 'Label', 'JudicialUser'
  ];
  private static readonly DEFAULT_INPUT_TEXT = 'text';
  private static readonly DEFAULT_INPUT_TEXTAREA = 'textAreas';

  public static addValidators(caseField: CaseField, control: AbstractControl): AbstractControl {
    if (
      caseField.display_context === Constants.MANDATORY &&
      FormValidatorsService.CUSTOM_VALIDATED_TYPES.indexOf(caseField.field_type.type) === -1
    ) {
      const validators = [Validators.required];
      if (caseField.field_type.type === 'Text') {
        validators.push(this.markDownPatternValidator());
        if (caseField.field_type.regular_expression) {
          validators.push(Validators.pattern(caseField.field_type.regular_expression));
        } else {
          validators.push(this.emptyValidator());
        }
        if (caseField.field_type.min && (typeof caseField.field_type.min === 'number')) {
          validators.push(Validators.minLength(caseField.field_type.min));
        }
        if (caseField.field_type.max && (typeof caseField.field_type.max === 'number')) {
          validators.push(Validators.maxLength(caseField.field_type.max));
        }
      }

      if (caseField.field_type.type === 'TextArea') {
        validators.push(this.emptyValidator());
        validators.push(this.markDownPatternValidator());
      }

      if (control.validator) {
        validators.push(control.validator);
      }
      control.setValidators(validators);
    } else if (caseField.display_context === 'OPTIONAL' && (caseField.field_type.type === 'Text' || caseField.field_type.type === 'TextArea')
      || (caseField.display_context === 'COMPLEX' && caseField.field_type.type === 'Complex')) {
      control.setValidators(this.markDownPatternValidator());
    }

    return control;
  }

  public static emptyValidator(): ValidatorFn {
    const validator = (control: AbstractControl): ValidationErrors | null => {
      if (control?.value?.toString().trim().length === 0) {
        return { required: {} };
      }
      return null;
    };
    return validator;
  }

  public static markDownPatternValidator(): ValidatorFn {
    // Matches: [text](url), ![alt](url), <img ...>, <a ...>...</a>
    const inlineMarkdownPattern = /(?:!?\[[^\]]{0,500}\]\([^)]{0,500}\)|<(?:img\b[^>]{0,500}>|a\b[^>]{0,500}>[\s\S]*?<\/a>))/i;

    // Matches: [text][id], ![alt][id], and the collapsed form [text][]
    const referenceBoxPattern = /(!)?\[((?:[^[\]\\]|\\.){0,500})\]\s*\[([^\]]{0,100})\]/;

    // Matches: autolinks such as <http://example.com>
    const autolinkPattern = /<(?:[A-Za-z][A-Za-z0-9+.-]*:[^ <>\n]*|[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)>/;

    return (control: AbstractControl): ValidationErrors | null => {
      const value = control?.value?.toString().trim();
      return (value && (inlineMarkdownPattern.test(value) || referenceBoxPattern.test(value) || this.matchesReferenceUrlDef(value) || autolinkPattern.test(value) || this.hasMultiBracket(value as string))) ? { markDownPattern: {} } : null;
    };
  }

  // TODO: Strip this out as it's only here for the moment because
  // the service is being injected all over the place but it doesn't
  // need to be as FormValidatorsService.addValidators is perfectly
  // happy being static.
  public addValidators(caseField: CaseField, control: AbstractControl): AbstractControl {
    return FormValidatorsService.addValidators(caseField, control);
  }

  public addMarkDownValidators(formGroup: AbstractControl, controlPath: string): AbstractControl {
    const control = formGroup.get(controlPath);
    if (control) {
      control.setValidators(FormValidatorsService.markDownPatternValidator());
      control.updateValueAndValidity();
    }
    return control;
  }

  // Check for multi-bracket markdown links and validate destination URL
  private static hasMultiBracket(value: string): boolean {

    // Sonar-friendly detector: opening-run + text + first closing ']'
    const openingTextClosePattern = /\[{1,10}[^[\]\n]{1,60}\]/;

    // Can add an additional RegEx for additional URL validation rules if needed here

    let scanIndex = 0;
    const totalLength = value.length;

    while (scanIndex < totalLength) {
      const seg = this.findOpeningTextClose(value, scanIndex, openingTextClosePattern);
      if (!seg) {
        return false; // no candidate -> no match
      }

      const runs = this.extendClosingRunAndRequireParen(value, seg.absStart, seg.afterFirstClose);
      if (runs && runs.openingRunCount === runs.closingRunCount) {
        // If there were additional validation rules, they would be applied here
        return true;
      }

      // Advance to avoid stalling on overlaps
      scanIndex = seg.absStart + 1;
    }
    return false;
  }

  // Find opening '[' run, text, and first closing ']'
  private static findOpeningTextClose(
    source: string,
    fromIndex: number,
    pattern: RegExp
  ): { absStart: number; afterFirstClose: number } | null {
    const slice = source.slice(fromIndex);
    const match = pattern.exec(slice);
    if (!match) {
      return null;
    }
    const absStart = fromIndex + match.index;
    const afterFirstClose = absStart + match[0].length; // index just after the first ']'
    return { absStart, afterFirstClose };
  }

  // Count opening '[' run, extend the ']' run, and require '(' right after the full ']' run
  private static extendClosingRunAndRequireParen(
    source: string,
    absStart: number,
    afterFirstClose: number
  ): { openingRunCount: number; closingRunCount: number; afterOpenParen: number } | null {
    const n = source.length;

    // Count opening '[' run (e.g., '[[[')
    let openingRunCount = 0;
    for (let i = absStart; i < n && source[i] === '['; i++) {
      openingRunCount++;
    }

    // Extend closing ']' run forward from the first one
    let closingRunCount = 1;
    let afterClosingRun = afterFirstClose;
    while (afterClosingRun < n && source[afterClosingRun] === ']') {
      closingRunCount++;
      afterClosingRun++;
    }

    return { openingRunCount, closingRunCount, afterOpenParen: afterClosingRun + 1 };
  }

  private static isValidReferenceUrlTitleTail(tail: string): boolean {
    const possibleTitle = tail.trim();
    // Accept exactly one of: "title", 'title', (title) — bounded and single-line.
    if (!possibleTitle || /^"[^"\r\n]{0,300}"$/.test(possibleTitle) || /^'[^'\r\n]{0,300}'$/.test(possibleTitle) || /^\([^)\r\n]{0,300}\)$/.test(possibleTitle)) {
      return true;
    }
    return false;
  }


  private static matchesReferenceUrlDef(line: string): boolean {
    // Single-line, pragmatic CommonMark-style reference definition e.g. [text]: http://example.com
    const baseReferenceUrlPattern = /^[ \t]{0,3}\[([^\]]{1,100})\]:[ \t]*<?([^\s>]{1,2048})>?[ \t]*([^ \t\r\n].*)?$/m;

    const mainRegEx = baseReferenceUrlPattern.exec(line);
    if (!mainRegEx) return false;
    const tail = mainRegEx[3] ?? "";
    return this.isValidReferenceUrlTitleTail(tail);
  }
}
