import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { OptionsType } from '..';

@Injectable()
export class RequestOptionsBuilder {

    public static readonly FIELD_PREFIX = 'case.';

    /**
     * Assess the value to see if it should be included in the request options.
     * If it's null or an "empty" string, it shouldn't be.
     *
     * @param value The value to be assessed.
     */
    private static includeParam(value: any): boolean {
      if (Array.isArray(value)) {
        return value.some(item => RequestOptionsBuilder.includeParam(item));
      }
      /* istanbul ignore else */
      if (value) {
        /* istanbul ignore else */
        if (typeof(value) === 'string') {
          return value.trim().length > 0;
        }
        return true;
      }
      return false;
    }

    private static sanitiseValue(value: any): any {
      const trimmedValue = value.trim ? value.trim() : value;
      return trimmedValue.replace ? trimmedValue.replace(/’/i, `'`) : trimmedValue;
    }

    private static getValueByPath(value: any, path: string): any {
      return path.split('.').reduce((currentValue, pathPart) => {
        if (currentValue === undefined || currentValue === null) {
          return undefined;
        }
        return currentValue[pathPart];
      }, value);
    }

    private static getCollectionValues(value: any, criterion: string): any[] {
      if (!Array.isArray(value) ||
        criterion.indexOf('.value.') < 0 ||
        value.some(item => item === null || typeof item !== 'object' || !Object.prototype.hasOwnProperty.call(item, 'value'))) {
        return value;
      }
      const valuePath = criterion.substring(criterion.indexOf('.value.') + 1);
      return value.map(item => RequestOptionsBuilder.getValueByPath(item, valuePath));
    }

    private static appendParam(params: HttpParams, key: string, value: any): HttpParams {
      if (Array.isArray(value)) {
        const values = value
          .filter(item => RequestOptionsBuilder.includeParam(item))
          .map(item => RequestOptionsBuilder.sanitiseValue(item));
        return params.set(key, `[${values.join(', ')}]`);
      }
      return params.set(key, RequestOptionsBuilder.sanitiseValue(value));
    }

    public buildOptions(metaCriteria: object, caseCriteria: object, view?: SearchView): OptionsType {
      // TODO: This should probably be the now built-in URLSearchParams but it
      // requires a bigger refactor and there are bigger fish to fry right now.
      let params = new HttpParams();

      /* istanbul ignore else */
      if (view) {
        params = params.set('view', view);
      }

      /* istanbul ignore else */
      if (metaCriteria) {
        for (const criterion of Object.keys(metaCriteria)) {
          // EUI-3490. Make sure the parameter should be included for adding it.
          // This was already handled by the old URLSearchParams mechanism.
          if (RequestOptionsBuilder.includeParam(metaCriteria[criterion])) {
            params = params.set(criterion, metaCriteria[criterion]);
          }
        }
      }

      /* istanbul ignore else */
      if (caseCriteria) {
        for (const criterion of Object.keys(caseCriteria)) {
          /* istanbul ignore else */
          if (RequestOptionsBuilder.includeParam(caseCriteria[criterion])) {
            const key = RequestOptionsBuilder.FIELD_PREFIX + criterion;
            params = RequestOptionsBuilder.appendParam(
              params,
              key,
              RequestOptionsBuilder.getCollectionValues(caseCriteria[criterion], criterion)
            );
          }
        }
      }

      const options: OptionsType = { params, observe: 'body'};
      return options;
    }

}

export type SearchView = 'SEARCH' | 'WORKBASKET';
