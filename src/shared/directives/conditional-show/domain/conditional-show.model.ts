import { _ as _score } from 'underscore';

import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { ConditionParser } from '../services/condition-parser.service';

export class ShowCondition {

  private static readonly AND_CONDITION_REGEXP = new RegExp('\\sAND\\s(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)', 'g');
  private static readonly OR_CONDITION_REGEXP = new RegExp('\\sOR\\s(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)', 'g');
  private static readonly CONDITION_NOT_EQUALS = '!=';
  private static readonly CONDITION_EQUALS = '=';
  private static readonly CONTAINS = 'CONTAINS';
  private static instanceCache = new Map<string, ShowCondition>();

  private orConditions: string[] = null;
  private andConditions: string[] = null;

  private conditions = [];

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
    const extracted = conditionsArray.map(condition => {
      if (condition.startsWith(pathPrefix)) {
        return condition;
      }
      return `${pathPrefix}.${condition}`;
    });
    return extracted;
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
    this.conditions = ConditionParser.parse(condition);
  }

  public match(fields: object, path?: string): boolean {
    console.log(fields);

    return ConditionParser.evaluate(fields, this.conditions);
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
}
