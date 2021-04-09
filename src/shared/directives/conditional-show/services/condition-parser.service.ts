import { _ as _score } from 'underscore';
import peg from './condition.peg';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { ShowCondition } from '../../conditional-show/domain/conditional-show.model';

export class ConditionParser {

  /**
   * Parse the raw formula and output structured condition data
   * that can be used in evaluating show/hide logic
   * @param condition raw formula e.g. TextField = "Hello"
   */
  public static parse(condition: string): any {
    if (!condition) { return null };
    condition = condition.replace(/CONTAINS/g, ' CONTAINS');
    return peg.parse(condition.trim(), {});
  }

  /**
   * Evaluate the current fields against the conditions
   * @param fields the current page fields and their value
   * @param conditions The PegJS formula output
   */
  public static evaluate(fields: any, conditions: any[], path?: string): boolean {
    if (!conditions) { return true };
    const validJoinComparators = ['AND', 'OR'];

    const result: boolean = conditions.reduce((accumulator: boolean, condition, index: number) => {
      const isJoinComparator = (comparator: string): boolean =>
        (typeof comparator === 'string' && validJoinComparators.indexOf(comparator) !== -1);

      if (isJoinComparator(condition)) { return accumulator };

      let currentConditionResult = true;

      if (Array.isArray(condition)) {
        currentConditionResult = this.evaluate(fields, condition);

        if (isJoinComparator(conditions[index - 1])) {
          return this.evaluateJoin(accumulator, conditions[index - 1], currentConditionResult);
        }
      }

      if (condition.comparator) {
        const formula = condition.fieldReference + condition.comparator + condition.value;
        currentConditionResult = this.matchEqualityCondition(fields, formula, path);
      }

      if (isJoinComparator(conditions[index - 1])) {
        return this.evaluateJoin(accumulator, conditions[index - 1], currentConditionResult);
      }

      return currentConditionResult;
    }, true);

    return result;
  }

  private static evaluateJoin(leftResult: boolean, comparator, rightResult: boolean): boolean {
    switch (comparator) {
      case 'OR': return leftResult || rightResult;
      case 'AND': return leftResult && rightResult;
    }
  }

  private static matchEqualityCondition(fields: object, condition: string, path?: string): boolean {
    const [field, conditionSeparator] = this.getField(condition);
    const [head, ...tail] = field.split('.');
    const currentValue = this.findValueForComplexCondition(fields, head, tail, path);
    const expectedValue = this.unquoted(condition.split(conditionSeparator)[1]);
    if (conditionSeparator === ShowCondition.CONTAINS) {
      return this.checkValueContains(expectedValue, currentValue);
    } else {
      return this.checkValueEquals(expectedValue, currentValue, conditionSeparator);
    }
  }

  private static getValue(fields: object, head: string): any {
    if (this.isDynamicList(fields[head])) {
      return fields[head].value.code;
    } else {
      return fields[head];
    }
  }

  private static isDynamicList(dynamiclist: object): boolean {
    return !_score.isEmpty(dynamiclist) &&
        (_score.has(dynamiclist, 'value') && _score.has(dynamiclist, 'list_items'));
  }

  private static getField(condition: string): [string, string?] {
    let separator: string = ShowCondition.CONTAINS;
    if (condition.indexOf(ShowCondition.CONTAINS) < 0) {
      separator = ShowCondition.CONDITION_EQUALS;
      if (condition.indexOf(ShowCondition.CONDITION_NOT_EQUALS) > -1) {
        separator = ShowCondition.CONDITION_NOT_EQUALS;
      }
    }
    return [ condition.split(separator)[0], separator ];
  }

  private static checkValueEquals(expectedValue: string, currentValue: any, conditionSeparaor: string): boolean {
    if (expectedValue.search('[,]') > -1) { // for  multi-select list
      return this.checkMultiSelectListEquals(expectedValue, currentValue, conditionSeparaor);
    } else if (expectedValue.endsWith('*') && currentValue && conditionSeparaor !== ShowCondition.CONDITION_NOT_EQUALS) {
      if (typeof currentValue === 'string') {
        return currentValue.startsWith(this.removeStarChar(expectedValue));
      }
      return expectedValue === '*';
    } else {
      // changed from '===' to '==' to cover number field conditions
      if (conditionSeparaor === ShowCondition.CONDITION_NOT_EQUALS) {
        return this.checkValueNotEquals(expectedValue, currentValue);
      } else {
        return currentValue == expectedValue || this.okIfBothEmpty(expectedValue, currentValue); // tslint:disable-line
      }
    }
  }

  private static checkValueNotEquals(expectedValue: string, currentValue: any): boolean {
    const formatCurrentValue = currentValue ? currentValue.toString().trim() : '';
    if ('*' === expectedValue && formatCurrentValue !== '') {
      return false;
    }
    const formatExpectedValue = expectedValue ? expectedValue.toString().trim() : '';
    return formatCurrentValue != formatExpectedValue; // tslint:disable-line
  }

  private static checkMultiSelectListEquals(expectedValue: string, currentValue: any, conditionSeparator: string): boolean {
    const expectedValues = expectedValue.split(',').sort().toString();
    const values = currentValue ? currentValue.sort().toString() : '';
    if (conditionSeparator === ShowCondition.CONDITION_NOT_EQUALS) {
      return expectedValues !== values;
    } else {
      return expectedValues === values;
    }
  }

  private static checkValueContains(expectedValue: string, currentValue: any): boolean {
    if (expectedValue.search(',') > -1) {
      const expectedValues = expectedValue.split(',').sort();
      const values = currentValue ? currentValue.sort().toString() : '';
      return expectedValues.every(item => values.search(item) >= 0);
    } else {
      const values = currentValue && Array.isArray(currentValue) ? currentValue.toString() : '';
      return values.search(expectedValue) >= 0;
    }
  }

  private static unquoted(str: string): string {
    const res = str.replace(/^"|"$/g, '');
    return res;
  }

  private static findValueForComplexCondition(fields: object, head: string, tail: string[], path?: string): any {
    if (!fields) {
      return undefined;
    }
    if (tail.length === 0) {
      return this.getValue(fields, head);
    } else {
      if (FieldsUtils.isArray(fields[head])) {
        return this.findValueForComplexConditionInArray(fields, head, tail, path);
      } else {
        return this.findValueForComplexConditionForPathIfAny(fields, head, tail, path);
      }
    }
  }

  private static findValueForComplexConditionForPathIfAny(fields: object, head: string, tail: string[], path?: string): any {
    if (path) {
      const [_, ...pathTail] = path.split(/[_]+/g);
      return this.findValueForComplexCondition(fields[head], tail[0], tail.slice(1), pathTail.join('_'));
    } else {
      return this.findValueForComplexCondition(fields[head], tail[0], tail.slice(1), path);
    }
  }

  private static findValueForComplexConditionInArray(fields: object, head: string, tail: string[], path?: string): any {
  // use the path to resolve which array element we refer to
    if (path.startsWith(head)) {
      const [_, ...pathTail] = path.split(/[_]+/g);
      if (pathTail.length > 0) {
        try {
          let arrayIndex = Number.parseInt(pathTail[0], 10);
          const [__, ...dropNumberPath] = pathTail;
          return (fields[head][arrayIndex] !== undefined) ? this.findValueForComplexCondition(
          fields[head][arrayIndex]['value'], tail[0], tail.slice(1), dropNumberPath.join('_')) : null;
        } catch (e) {
          console.error('Error while parsing number', pathTail[0], e);
        }
      }
    } else {
      console.error('Path in formArray should start with ', head, ', full path: ', path);
    }
  }

  private static removeStarChar(str: string): string {
    if (str && str.indexOf('*') > -1) {
      return str.substring(0, str.indexOf('*'));
    }
    return str;
  }

  private static okIfBothEmpty(right: string, value: any): boolean {
    return value === null && (right === '');
  }
}
