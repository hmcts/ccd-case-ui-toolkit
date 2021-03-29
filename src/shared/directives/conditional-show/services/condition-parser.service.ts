import { PegConditionResult } from '../models/peg-result.model';
import { _ as _score } from 'underscore';
import peg from './condition.peg';

export class ConditionParser {

    /**
     * Parse the raw formula and output structured condition data
     * that can be used in evaluating show/hide logic
     * @param condition raw formula e.g. TextField = "Hello"
     */
    public static parse(condition: string): any {
        if (!condition) return null;

        return peg.parse(condition.trim(), {});
    }

    /**
     * Evaluate the current fields against the conditions
     * @param fields the current page fields and their value
     * @param conditions The PegJS formula output
     */
    public static evaluate(fields: any, conditions: any[]): boolean {
        if (!conditions) return true;
        const validJoinComparators = ['AND', 'OR'];

        const result: boolean = conditions.reduce((accumulator: boolean, condition, index: number) => {
            const isJoinComparator = (comparator: string): boolean => (typeof comparator === 'string' && validJoinComparators.indexOf(comparator) !== -1);
            if (isJoinComparator(condition)) return accumulator;

            let currentConditionResult = true;

            if (Array.isArray(condition)) {
                currentConditionResult = this.evaluate(fields, condition);

                if (isJoinComparator(conditions[index - 1])) return this.evaluateJoin(accumulator, conditions[index - 1], currentConditionResult);
            }

            if (condition.comparator) {
                const fieldValue: string = this.getValue(fields, condition.fieldReference);

                currentConditionResult = this.evaluateEqualityCheck(fieldValue, condition.value, condition.comparator);
            }

            if (isJoinComparator(conditions[index - 1])) return this.evaluateJoin(accumulator, conditions[index - 1], currentConditionResult);

            return currentConditionResult;
            
        }, true);

        return result;
    }

    private static evaluateEqualityCheck(fieldValue: string, conditionValue: string, comparator: string): boolean {
        switch (comparator) {
            case '=': return (fieldValue === conditionValue);
            case '!=': return (fieldValue !== conditionValue);
            case 'CONTAINS': return (fieldValue && fieldValue.indexOf(conditionValue) !== -1);
        }
    }

    private static evaluateJoin(leftResult: boolean, comparator, rightResult: boolean): boolean {
        switch (comparator) {
            case 'OR': return leftResult || rightResult;
            case 'AND': return leftResult && rightResult;
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
}