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
            const value = caseCriteria[criterion].trim ? caseCriteria[criterion].trim() : caseCriteria[criterion];
            params = params.set(key, value.replace(/’/i, `'`));
          }
        }
      }

      const options: OptionsType = { params, observe: 'body'};
      return options;
    }

}

export type SearchView = 'SEARCH' | 'WORKBASKET';
