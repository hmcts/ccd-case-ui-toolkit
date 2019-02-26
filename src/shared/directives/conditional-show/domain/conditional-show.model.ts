import { CaseField } from '../../../domain/definition';
import { FieldsUtils } from '../../../services/fields';

export class ShowCondition {

  private static readonly AND_CONDITION_REGEXP = new RegExp('\\sAND\\s(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)', 'g');
  private static readonly CONTAINS = 'CONTAINS';

  // Expects a show condition of the form: <fieldName>="string"
  constructor(public condition: string) {
  }

  match(fields, path?: string): boolean {
    // if (path) {
    //   console.log('ShowCondition path', path);
    // }
    if (!this.condition) {
      return true;
    }
    return this.matchAndConditions(fields, this.condition, path);
  }

  private matchAndConditions(fields: any, condition: string, path?: string): boolean {
    let andConditions = condition.split(ShowCondition.AND_CONDITION_REGEXP);
    return andConditions.every(andCondition => this.matchEqualityCondition(fields, andCondition, path));
  }

  private matchEqualityCondition(fields: any, condition: string, path?: string): boolean {
    // console.log('fields', JSON.stringify(fields, null, 2));
    if (condition.search(ShowCondition.CONTAINS) === -1) {
      let field = condition.split('=')[0];
      let right = this.unquoted(condition.split('=')[1]);
      const [head, ...tail] = field.split('.');
      let value = this.findValueForComplexCondition(fields, head, tail, path);

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
      let value = this.findValueForComplexCondition(fields, head, tail, path);

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

  private findValueForComplexCondition(fields: any, head: string, tail: string[], path?: string) {
    if (tail.length === 0) {
      return fields[head];
    } else {
      if (Array.isArray(fields[head])) {
        // use the path to resolve which array element we refer to
        if (path.startsWith(head)) {
          const [_, ...pathTail] = path.split(/[_]+/g);
          if (pathTail.length > 0) {
            try {
              let arrayIndex = Number.parseInt(pathTail[0], 10);
              const [__, ...dropNumberPath] = pathTail;
              return this.findValueForComplexCondition(fields[head][arrayIndex]['value'], tail[0], tail.slice(1), dropNumberPath.join('_'));
            } catch (e) {
              console.log('Error while parsing number', pathTail[0], e);
            }
          }
        } else {
          console.log('Path in formArray should start with ', head, ', full path: ', path);
        }
      } else {
        if (path) {
          const [_, ...pathTail] = path.split(/[_]+/g);
          return this.findValueForComplexCondition(fields[head], tail[0], tail.slice(1), pathTail.join('_'));
        } else {
          return this.findValueForComplexCondition(fields[head], tail[0], tail.slice(1), path);
        }
      }
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
