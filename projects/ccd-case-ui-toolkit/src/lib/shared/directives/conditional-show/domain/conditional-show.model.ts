import  * as _score from 'underscore';

import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { ConditionParser } from '../services/condition-parser.service';

export class ShowCondition {

  public static readonly CONDITION_NOT_EQUALS = '!=';
  public static readonly CONDITION_EQUALS = '=';
  public static readonly CONTAINS = 'CONTAINS';
  private static instanceCache = new Map<string, ShowCondition>();
  private static readonly validJoinComparators = ['AND', 'OR'];
  private static processedList: string[] = [];
  private conditions = [];

  public static addPathPrefixToCondition(showCondition: string, pathPrefix: string): string {
    if (!pathPrefix || pathPrefix === '') {
      return showCondition;
    }
    if (!showCondition) {
      return '';
    }

    const formula = ConditionParser.parse(showCondition);
    if (!formula) {
      return showCondition;
    }
    this.processedList = [];
    showCondition = showCondition.replace(/CONTAINS/g, ' CONTAINS');
    const processedCondition = this.processAddPathPrefixToCondition(formula, pathPrefix, showCondition);
    return processedCondition.replace(/ CONTAINS/g, 'CONTAINS');
  }

  private static processAddPathPrefixToCondition(formula: any, pathPrefix: string, originalCondition: string): string {
    let finalCondition: string = originalCondition;
    if (Array.isArray(formula)) {
      formula.forEach(condition => {
        if (typeof condition === 'string' && this.validJoinComparators.indexOf(condition) !== -1) {
          // do nothing
        } else {
          if (Array.isArray(condition)) {
            finalCondition = this.processAddPathPrefixToCondition(condition, pathPrefix, finalCondition)
          } else {
            finalCondition = this.extractConditions(condition, pathPrefix, finalCondition)
          }
        }
      });
    } else {
      finalCondition = this.extractConditions(formula, pathPrefix, finalCondition)
    }
    return finalCondition;
  }

  private static extractConditions(condition: any, pathPrefix: string, originalCondition: string): string {
    if (condition.fieldReference.startsWith(pathPrefix)) {
      return originalCondition;
    } else {
      if (originalCondition.indexOf(condition.fieldReference) > -1) {
        if (this.processedList && this.processedList.indexOf(condition.fieldReference) === -1) {
          this.processedList.push(condition.fieldReference);
          const regularExp = new RegExp('(\\b)' + condition.fieldReference + '(?=[^"]*(?:"[^"]*"[^"]*)*$)(\\b)', 'g');
          return originalCondition.replace(regularExp, pathPrefix + '.' + condition.fieldReference);
        } else {
          return originalCondition;
        }
      }
    }
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

  private static getConditions(formula: any): string {
    const conditionList: string[] = [];
    if (!!formula) {
      const newFormula = typeof formula === 'string' ? JSON.parse(formula) : formula;
      if (Array.isArray(newFormula)) {
        newFormula.forEach(condition => {
          if (!(typeof condition === 'string' && this.validJoinComparators.indexOf(condition) !== -1)) {
            if (Array.isArray(condition)) {
              conditionList.push(ShowCondition.getConditions(condition).toString());
            } else {
              conditionList.push(condition.fieldReference + condition.comparator + condition.value);
            }
          }
        });
      } else {
        conditionList.push(newFormula.fieldReference + newFormula.comparator + newFormula.value);
      }
    }
    return conditionList.toString();
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
    if (showCondition && showCondition.conditions.length && caseFields) {
      const conditions: string[] = this.getConditions(showCondition.conditions).split(',');
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
      this.conditions = ConditionParser.parse(condition);
    }
  }

  public match(fields: object, path?: string): boolean {
    return ConditionParser.evaluate(fields, this.conditions, this.updatePathName(path));
  }

  private updatePathName(path: string): string {
    if (path && path.split(/[_]+/g).length > 0) {
       /* tslint:disable-next-line */
      let [pathName, ...pathTail] = path.split(/[_]+/g);
      const pathFinalIndex = pathTail.pop();
      const pathTailString = pathTail.toString();

      pathTail = pathTail.map((value) => {
        return Number(pathFinalIndex) === Number(value) ? pathName : value;
      });

      return pathTailString !== pathTail.toString()
        ? `${pathName}_${pathTail.join('_')}_${pathFinalIndex}`
        : path;
    } else {
      return path;
    }
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
}
