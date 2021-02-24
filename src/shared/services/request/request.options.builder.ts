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
      if (value) {
        if (typeof(value) === 'string') {
          return value.trim().length > 0;
        }
        return true;
      }
      return false;
    }

    buildOptions(metaCriteria: object, caseCriteria: object, view?: SearchView): OptionsType {
      // TODO: This should probably be the now built-in URLSearchParams but it
      // requires a bigger refactor and there are bigger fish to fry right now.
      let params = new HttpParams();

      if (view) {
        params = params.set('view', view);
      }

      if (metaCriteria) {
        for (let criterion of Object.keys(metaCriteria)) {
          // EUI-3490. Make sure the parameter should be included for adding it.
          // This was already handled by the old URLSearchParams mechanism.
          if (RequestOptionsBuilder.includeParam(metaCriteria[criterion])) {
            params = params.set(criterion, metaCriteria[criterion]);
          }
        }
      }

      if (caseCriteria) {
        for (let criterion of Object.keys(caseCriteria)) {
          if (RequestOptionsBuilder.includeParam(caseCriteria[criterion])) {
            params = params.set(RequestOptionsBuilder.FIELD_PREFIX + criterion, caseCriteria[criterion].trim());
          }
        }
      }

      let options: OptionsType = { params, observe: 'body'};
      return options;
    }

}

export type SearchView = 'SEARCH' | 'WORKBASKET';
