import { CaseField } from '../../../domain/definition';
import { FieldsUtils } from '../../../services/fields';

export class ShowCondition {

  private static readonly AND_CONDITION_REGEXP = new RegExp('\\sAND\\s(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)', 'g');
  private static readonly CONTAINS = 'CONTAINS';

  // Expects a show condition of the form: <fieldName>="string"
  constructor(public condition: string) {
  }

  match(fields): boolean {
    if (!this.condition) {
      return true;
    }
    return this.matchAndConditions(fields, this.condition);
  }

  private matchAndConditions(fields: any, condition: string): boolean {
    let andConditions = condition.split(ShowCondition.AND_CONDITION_REGEXP);
    return andConditions.every(andCondition => this.matchEqualityCondition(fields, andCondition));
  }

  private matchEqualityCondition(fields: any, condition: string): boolean {
    if (condition.search(ShowCondition.CONTAINS) === -1) {
      let field = condition.split('=')[0];
      let right = this.unquoted(condition.split('=')[1]);
      const [head, ...tail] = field.split('.');
      let value = this.findValueForComplexCondition(fields, head, tail);

      if (right.search('[,]') > -1) { // for  multi-select list
        let rights = right.split(',').sort().toString();
        let values = value ? value.sort().toString() : '';
        return rights === values;
      } else if (right.endsWith('*') && value) {
        return value.startsWith(this.removeStarChar(right));
      } else {
        // changed from '===' to '==' to cover number field conditions
        return value == right || this.okIfBothEmpty(right, value); // tslint:disable-line
      }
    } else {
      let field = condition.split(ShowCondition.CONTAINS)[0];
      let right = this.unquoted(condition.split(ShowCondition.CONTAINS)[1]);
      const [head, ...tail] = field.split('.');
      let value = this.findValueForComplexCondition(fields, head, tail);

      if (right.search(',') > -1) {
        let rights = right.split(',').sort();
        let values = value ? value.sort().toString() : '';
        return rights.every(item => values.search(item) >= 0);
      } else {
        let values = value && Array.isArray(value) ? value.toString() : '';
        return values.search(right) >= 0;
      }
    }
  }

  private findValueForComplexCondition(fields: any, head: string, tail: string[]) {
    if (tail.length === 0) {
      return fields[head];
    } else {
      return this.findValueForComplexCondition(fields[head], tail[0], tail.slice(1));
    }
  }

  private unquoted(str) {
    return str.replace(/^"|"$/g, '');
  }

  private removeStarChar(s: string) {
    return s.substring(0, s.length - 1);
  }

  matchByCaseFields(caseFields: CaseField[]): boolean {
    return this.match(FieldsUtils.toValuesMap(caseFields));
  }

  private okIfBothEmpty(right: string, value: any) {
    return value === null && (right === '');
  }

}
