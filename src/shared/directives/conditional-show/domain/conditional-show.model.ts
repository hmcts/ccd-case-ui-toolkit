import { _ as _score } from 'underscore';

import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldsUtils } from '../../../services/fields/fields.utils';

export class ShowCondition {

  private static readonly AND_CONDITION_REGEXP = new RegExp('\\sAND\\s(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)', 'g');
  private static readonly OR_CONDITION_REGEXP = new RegExp('\\sOR\\s(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)', 'g');
  private static readonly CONDITION_NOT_EQUALS = '!=';
  private static readonly CONDITION_EQUALS = '=';
  private static readonly CONTAINS = 'CONTAINS';
  private static instanceCache = new Map<string, ShowCondition>();

  private orConditions: string[] = null;
  private andConditions: string[] = null;

  public static addPathPrefixToCondition(showCondition: string, pathPrefix: string): string {
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

  private static extractConditions(conditionsArray: string[], pathPrefix: string): string[] {
    return conditionsArray.map(condition => {
      if (!condition.startsWith(pathPrefix)) {
        return pathPrefix + '.' + condition;
      } else {
        return condition;
      }
    });
  }

  // Cache instances so that we can cache results more effectively
  public static getInstance(condition: string): ShowCondition {
    let instance = this.instanceCache.get(condition);
    if (!instance) {
      instance = new ShowCondition(condition);
      this.instanceCache.set(condition, instance);
    }
    return instance;
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

  /**
   * Determine whether a ShowCondition model is affected by fields that have
   * a display_context of HIDDEN or READONLY, which means they aren't able to
   * be changed by the user's actions.
   *
   * @param showCondition The ShowCondition model to evaluate.
   * @param caseFields Inspected to see appropriate display_contexts.
   */
  public static hiddenCannotChange(showCondition: ShowCondition, caseFields: CaseField[]): boolean {
    if (showCondition && caseFields) {
      const conditions: string[] = showCondition.andConditions || showCondition.orConditions;
      if (conditions && conditions.length > 0) {
        let allUnchangeable = true;
        for (const condition of conditions) {
          const [field] = ShowCondition.getField(condition);
          const path: string[] = field.split('.');
          let head = path.shift();
          let caseField: CaseField = caseFields.find(cf => cf.id === head);
          while (path.length > 0) {
            head = path.shift();
            if (caseField) {
              // Jump out if this is HIDDEN or READONLY, regardless of whether or not it's
              // complex or a collection - nested fields will "inherit" the display_context.
              if (['HIDDEN', 'READONLY'].indexOf(caseField.display_context) > -1) {
                break;
              }

              // Consider what type of field this is.
              const ft = caseField.field_type;
              switch (ft.type) {
                case 'Collection':
                  if (ft.collection_field_type.type === 'Complex' && ft.collection_field_type.complex_fields) {
                    caseField = ft.collection_field_type.complex_fields.find(cf => cf.id === head);
                  }
                  break;
                case 'Complex':
                  if (ft.complex_fields) {
                    caseField = ft.complex_fields.find(cf => cf.id === head);
                  }
                  break;
              }
            }
          }
          if (caseField) {
            allUnchangeable = allUnchangeable && ['HIDDEN', 'READONLY'].indexOf(caseField.display_context) > -1;
          } else {
            allUnchangeable = false;
          }
        }
        return allUnchangeable;
      }
    }
    return false;
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

  public match(fields: object, path?: string): boolean {
    if (!this.condition) {
      return true;
    }
    return this.matchAndConditions(fields, path);
  }

  public matchByContextFields(contextFields: CaseField[]): boolean {
    return this.match(FieldsUtils.toValuesMap(contextFields));
  }

  /**
   * Determine whether this is affected by fields that have a display_context
   * of HIDDEN or READONLY, which means they aren't able to be changed by the
   * user's actions.
   *
   * @param caseFields Inspected to see appropriate display_contexts.
   */
  public hiddenCannotChange(caseFields: CaseField[]): boolean {
    return ShowCondition.hiddenCannotChange(this, caseFields);
  }

  private matchAndConditions(fields: object, path?: string): boolean {
    if (!!this.orConditions)  {
      return this.orConditions.some(orCondition => this.matchEqualityCondition(fields, orCondition, path));
    } else if (!!this.andConditions) {
      return this.andConditions.every(andCondition => this.matchEqualityCondition(fields, andCondition, path));
    } else {
      return false;
    }
  }

  private matchEqualityCondition(fields: object, condition: string, path?: string): boolean {
    const [field, conditionSeparator] = ShowCondition.getField(condition);
    const [head, ...tail] = field.split('.');
    const currentValue = this.findValueForComplexCondition(fields, head, tail, path);
    const expectedValue = this.unquoted(condition.split(conditionSeparator)[1]);
    if (conditionSeparator === ShowCondition.CONTAINS) {
      return this.checkValueContains(expectedValue, currentValue);
    } else {
      return this.checkValueEquals(expectedValue, currentValue, conditionSeparator);
    }
  }

  private checkValueEquals(expectedValue: string, currentValue: any, conditionSeparaor: string): boolean {
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

  private checkValueNotEquals(expectedValue: string, currentValue: any): boolean {
    const formatCurrentValue = currentValue ? currentValue.toString().trim() : '';
    if ('*' === expectedValue && formatCurrentValue !== '') {
      return false;
    }
    const formatExpectedValue = expectedValue ? expectedValue.toString().trim() : '';
    return formatCurrentValue != formatExpectedValue; // tslint:disable-line
  }

  private checkMultiSelectListEquals(expectedValue: string, currentValue: any, conditionSeparator: string): boolean {
    const expectedValues = expectedValue.split(',').sort().toString();
    const values = currentValue ? currentValue.sort().toString() : '';
    if (conditionSeparator === ShowCondition.CONDITION_NOT_EQUALS) {
      return expectedValues !== values;
    } else {
      return expectedValues === values;
    }
  }

  private checkValueContains(expectedValue: string, currentValue: any): boolean {
    if (expectedValue.search(',') > -1) {
      let expectedValues = expectedValue.split(',').sort();
      let values = currentValue ? currentValue.sort().toString() : '';
      return expectedValues.every(item => values.search(item) >= 0);
    } else {
      let values = currentValue && Array.isArray(currentValue) ? currentValue.toString() : '';
      return values.search(expectedValue) >= 0;
    }
  }

  private findValueForComplexCondition(fields: object, head: string, tail: string[], path?: string): any {
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

  private findValueForComplexConditionForPathIfAny(fields: object, head: string, tail: string[], path?: string): any {
    if (path) {
      const [_, ...pathTail] = path.split(/[_]+/g);
      return this.findValueForComplexCondition(fields[head], tail[0], tail.slice(1), pathTail.join('_'));
    } else {
      return this.findValueForComplexCondition(fields[head], tail[0], tail.slice(1), path);
    }
  }

  private findValueForComplexConditionInArray(fields: object, head: string, tail: string[], path?: string): any {
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

  private getValue(fields: object, head: string): any {
    if (this.isDynamicList(fields[head])) {
      return fields[head].value.code;
    } else {
      return fields[head];
    }
  }

  private isDynamicList(dynamiclist: object): boolean {
    return !_score.isEmpty(dynamiclist) &&
      (_score.has(dynamiclist, 'value') && _score.has(dynamiclist, 'list_items'));
  }

  private unquoted(str: string): string {
    return str.replace(/^"|"$/g, '');
  }

  private removeStarChar(str: string): string {
    return str.substring(0, str.length - 1);
  }

  private okIfBothEmpty(right: string, value: any): boolean {
    return value === null && (right === '');
  }

}
