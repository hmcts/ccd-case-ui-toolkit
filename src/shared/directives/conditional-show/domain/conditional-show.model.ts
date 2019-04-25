import { CaseField } from '../../../domain/definition';
import { FieldsUtils } from '../../../services/fields';

export class ShowCondition {

  private static readonly AND_CONDITION_REGEXP = new RegExp('\\sAND\\s(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)', 'g');
  private static readonly OR_CONDITION_REGEXP = new RegExp('\\sOR\\s(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)', 'g');
  private static CONDITION_NOT_EQUALS = '!=';
  private static CONDITION_EQUALS = '=';
  private static readonly CONTAINS = 'CONTAINS';

  static addPathPrefixToCondition(showCondition: string, pathPrefix): string {
    if (!pathPrefix || pathPrefix === '') {
      return showCondition;
    }
    let andConditions = showCondition.split(ShowCondition.AND_CONDITION_REGEXP);
    andConditions = andConditions.map(condition => {
      if (!condition.startsWith(pathPrefix)) {
        return pathPrefix + '.' + condition;
      } else {
        return condition;
      }
    });
    return andConditions.join(' AND ');
  }

  // Expects a show condition of the form: <fieldName>="string"
  constructor(public condition: string) {
  }

  match(fields, path?: string): boolean {
    if (!this.condition) {
      return true;
    }
    return this.matchAndConditions(fields, this.condition, path);
  }

  private matchAndConditions(fields: any, condition: string, path?: string): boolean {
    if (condition.search(ShowCondition.OR_CONDITION_REGEXP) !== -1) {
      let orConditions = condition.split(ShowCondition.OR_CONDITION_REGEXP);
      return orConditions.some(orCondition => this.matchEqualityCondition(fields, orCondition));
    } else {
      let andConditions = condition.split(ShowCondition.AND_CONDITION_REGEXP);
      return andConditions.every(andCondition => this.matchEqualityCondition(fields, andCondition, path));
    }
  }

  private matchEqualityCondition(fields: any, condition: string, path?: string): boolean {
    if (condition.search(ShowCondition.CONTAINS) === -1) {
      let conditionSeparaor = ShowCondition.CONDITION_EQUALS;
      if (condition.indexOf(ShowCondition.CONDITION_NOT_EQUALS) !== -1) {
        conditionSeparaor = ShowCondition.CONDITION_NOT_EQUALS;
      }
      let field = condition.split(conditionSeparaor)[0];
      const [head, ...tail] = field.split('.');
      let currentValue = this.findValueForComplexCondition(fields, head, tail, path);
      let expectedValue = this.unquoted(condition.split(conditionSeparaor)[1]);

      return this.checkValueEquals(expectedValue, currentValue, conditionSeparaor);
    } else {
      let field = condition.split(ShowCondition.CONTAINS)[0];
      const [head, ...tail] = field.split('.');
      let currentValue = this.findValueForComplexCondition(fields, head, tail, path);
      let expectedValue = this.unquoted(condition.split(ShowCondition.CONTAINS)[1]);

      return this.checkValueContains(expectedValue, currentValue);
    }
  }

  private checkValueEquals(expectedValue, currentValue, conditionSeparaor): boolean {
    if (expectedValue.search('[,]') > -1) { // for  multi-select list
      let expectedValues = expectedValue.split(',').sort().toString();
      let values = currentValue ? currentValue.sort().toString() : '';
      if (conditionSeparaor === ShowCondition.CONDITION_NOT_EQUALS) {
        return expectedValues !== values;
      } else {
        return expectedValues === values;
      }
    } else if (expectedValue.endsWith('*') && currentValue && conditionSeparaor !== ShowCondition.CONDITION_NOT_EQUALS) {
      return currentValue.startsWith(this.removeStarChar(expectedValue));
    } else {
      // changed from '===' to '==' to cover number field conditions
      if (conditionSeparaor === ShowCondition.CONDITION_NOT_EQUALS) {
        if ('*' === expectedValue) {
          return false;
        }
        return currentValue != expectedValue; // tslint:disable-line
      } else {
        return currentValue == expectedValue || this.okIfBothEmpty(expectedValue, currentValue); // tslint:disable-line
      }
    }
  }

  private checkValueContains(expectedValue, currentValue): boolean {
    if (expectedValue.search(',') > -1) {
      let expectedValues = expectedValue.split(',').sort();
      let values = currentValue ? currentValue.sort().toString() : '';
      return expectedValues.every(item => values.search(item) >= 0);
    } else {
      let values = currentValue && Array.isArray(currentValue) ? currentValue.toString() : '';
      return values.search(expectedValue) >= 0;
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

  matchByContextFields(contextFields: CaseField[]): boolean {
    return this.match(FieldsUtils.toValuesMap(contextFields));
  }

  private okIfBothEmpty(right: string, value: any) {
    return value === null && (right === '');
  }

}
