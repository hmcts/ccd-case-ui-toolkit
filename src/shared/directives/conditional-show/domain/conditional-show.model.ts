import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { _ as _score } from 'underscore';

export class ShowCondition {

  private static readonly AND_CONDITION_REGEXP = new RegExp('\\sAND\\s(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)', 'g');
  private static readonly OR_CONDITION_REGEXP = new RegExp('\\sOR\\s(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)', 'g');
  private static CONDITION_NOT_EQUALS = '!=';
  private static CONDITION_EQUALS = '=';
  private static readonly CONTAINS = 'CONTAINS';
  private static instanceCache = new Map<string, ShowCondition>();

  // private dumbCache = new Map<string, boolean>();
  private orConditions: string[] = null;
  private andConditions: string[] = null;

  static addPathPrefixToCondition(showCondition: string, pathPrefix): string {
    if (!pathPrefix || pathPrefix === '') {
      return showCondition;
    }
    if (showCondition.search(ShowCondition.OR_CONDITION_REGEXP) !== -1) {
      let orConditions = showCondition.split(ShowCondition.OR_CONDITION_REGEXP);
      orConditions = this.extractConditions(orConditions, pathPrefix);
      return orConditions.join(' OR ');
    } else {
      let andConditions = showCondition.split(ShowCondition.AND_CONDITION_REGEXP);
      andConditions = this.extractConditions(andConditions, pathPrefix);
      return andConditions.join(' AND ');
    }
  }
  private static extractConditions(orConditions, pathPrefix) {
    orConditions = orConditions.map(condition => {
      if (!condition.startsWith(pathPrefix)) {
        return pathPrefix + '.' + condition;
      } else {
        return condition;
      }
    });
    return orConditions;
  }
  // Cache instances so that we can cache results more effectively
  public static getInstance(cond: string): ShowCondition {
    const inst = this.instanceCache.get(cond);
    if (inst) {
      return inst;
    } else {
      const newInst = new ShowCondition(cond);
      this.instanceCache.set(cond, newInst);
      return newInst;
    }
  }

  // Expects a show condition of the form: <fieldName>="string"
  constructor(public condition: string) {
    if (!!condition) {
      if (condition.search(ShowCondition.OR_CONDITION_REGEXP) !== -1) {
        this.orConditions = condition.split(ShowCondition.OR_CONDITION_REGEXP);
      } else {
        this.andConditions = condition.split(ShowCondition.AND_CONDITION_REGEXP);
      }
    }
  }
  match(fields, path?: string): boolean {
    if (!this.condition) {
      return true;
    }
    return this.matchAndConditions(fields, this.condition, path);
  }
  private matchAndConditions(fields: any, condition: string, path?: string): boolean {
    if (!!this.orConditions)  {
      return this.orConditions.some(orCondition => this.matchEqualityCondition(fields, orCondition, path));
    } else if (!!this.andConditions) {
      return this.andConditions.every(andCondition => this.matchEqualityCondition(fields, andCondition, path));
    } else {
      return false;
    }
  }

  private matchEqualityCondition(fields: any, condition: string, path?: string): boolean {
    if (condition.search(ShowCondition.CONTAINS) === -1) {
      let conditionSeparator = ShowCondition.CONDITION_EQUALS;
      if (condition.indexOf(ShowCondition.CONDITION_NOT_EQUALS) !== -1) {
        conditionSeparator = ShowCondition.CONDITION_NOT_EQUALS;
      }
      let field = condition.split(conditionSeparator)[0];
      const [head, ...tail] = field.split('.');
      let currentValue = this.findValueForComplexCondition(fields, head, tail, path);
      let expectedValue = this.unquoted(condition.split(conditionSeparator)[1]);

      return this.checkValueEquals(expectedValue, currentValue, conditionSeparator);
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
      return this.checkMultiSelectListEquals(expectedValue, currentValue, conditionSeparaor);
    } else if (expectedValue.endsWith('*') && currentValue && conditionSeparaor !== ShowCondition.CONDITION_NOT_EQUALS) {
      return currentValue.startsWith(this.removeStarChar(expectedValue));
    } else {
      // changed from '===' to '==' to cover number field conditions
      if (conditionSeparaor === ShowCondition.CONDITION_NOT_EQUALS) {
        return this.checkValueNotEquals(expectedValue, currentValue);
      } else {
        return currentValue == expectedValue || this.okIfBothEmpty(expectedValue, currentValue); // tslint:disable-line
      }
    }
  }

  private checkValueNotEquals(expectedValue, currentValue) {
    let formatCurrentValue = currentValue ? currentValue.toString().trim() : '';
    if ('*' === expectedValue && formatCurrentValue !== '') {
      return false;
    }
    let formatExpectedValue = expectedValue ? expectedValue.toString().trim() : '';
    return formatCurrentValue != formatExpectedValue; // tslint:disable-line
  }

  private checkMultiSelectListEquals(expectedValue, currentValue, conditionSeparaor) {
    let expectedValues = expectedValue.split(',').sort().toString();
    let values = currentValue ? currentValue.sort().toString() : '';
    if (conditionSeparaor === ShowCondition.CONDITION_NOT_EQUALS) {
      return expectedValues !== values;
    } else {
      return expectedValues === values;
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

  private findValueForComplexConditionForPathIfAny(fields: any, head: string, tail: string[], path?: string) {
    if (path) {
      const [_, ...pathTail] = path.split(/[_]+/g);
      return this.findValueForComplexCondition(fields[head], tail[0], tail.slice(1), pathTail.join('_'));
    } else {
      return this.findValueForComplexCondition(fields[head], tail[0], tail.slice(1), path);
    }
  }

  private findValueForComplexConditionInArray(fields: any, head: string, tail: string[], path?: string) {
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
          console.log('Error while parsing number', pathTail[0], e);
        }
      }
    } else {
      console.log('Path in formArray should start with ', head, ', full path: ', path);
    }
  }

  private getValue(fields, head) {
    if (this.isDynamicList(fields[head])) {
      return fields[head].value.code;
    } else {
      return fields[head];
    }
  }

  private isDynamicList(dynamiclist) {
    return !_score.isEmpty(dynamiclist) &&
      (_score.has(dynamiclist, 'value') && _score.has(dynamiclist, 'list_items'));
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
