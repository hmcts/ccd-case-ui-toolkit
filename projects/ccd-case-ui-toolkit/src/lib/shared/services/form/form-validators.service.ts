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
    const inlineMarkdownPattern = /(\[[^\]]{0,500}\]\([^)]{0,500}\)|!\[[^\]]{0,500}\]\([^)]{0,500}\)|<img[^>]{0,500}>|<a[^>]{0,500}>.*?<\/a>)/;

    // Matches [[text]](url), [[[text]]](url), etc
    const multiBracketPattern = /(?<bang>!)?(?<opens>\[+)(?<text>(?:[^\[\]\\]|\\.){1,500})(?<closes>\]+)\((?<url>(?:https?:\/\/)?(?:[A-Za-z0-9-]{1,63}\.){1,10}[A-Za-z]{2,24}(?:\/[^\s)]{0,1024})?)\)/i;
    // Helper: does value contain any valid multi-bracket match with equal counts?
    const hasMultiBracket = (s: string) => {
      const rx = new RegExp(multiBracketPattern.source, multiBracketPattern.flags);
      let m: RegExpExecArray | null;
      while ((m = rx.exec(s)) !== null) {
        const groups = m.groups || {};
        // ensure there is a matching number of opening and closing brackets
        const opens = (groups.opens as string | undefined)?.length ?? 0;
        const closes = (groups.closes as string | undefined)?.length ?? 0;
        if (opens === closes) return true;
        // safety: avoid infinite loops on zero-length matches
        if (m.index === rx.lastIndex) rx.lastIndex++;
      }
      return false;
    };

    // Matches: [text][id], ![alt][id], and the collapsed form [text][]
    const referenceBoxPattern = /(!)?\[((?:[^\[\]\\]|\\.){0,500})\]\s*\[([^\]]{0,100})\]/;

    // Single-line, pragmatic CommonMark-style reference definition e.g. [text]: http://example.com
    const referenceUrlPattern = /^[ \t]{0,3}\[([^\]]{1,100})\]:[ \t]*<?([^\s>]{1,2048})>?[ \t]*(?:(?:"([^"\r\n]{0,300})"|'([^'\r\n]{0,300})'|\(([^)\r\n]{0,300})\)))?[ \t]*$/m;

    // Matches: autolinks such as <http://example.com>
    const autolinkPattern = /<(?:[A-Za-z][A-Za-z0-9+.-]*:[^ <>\n]*|[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)>/;

    return (control: AbstractControl): ValidationErrors | null => {
      const value = control?.value?.toString().trim();
      return (value && (inlineMarkdownPattern.test(value) || referenceBoxPattern.test(value) || referenceUrlPattern.test(value) || autolinkPattern.test(value) || hasMultiBracket(value as string))) ? { markDownPattern: {} } : null;
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
}
