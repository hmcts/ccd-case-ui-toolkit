import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RequestOptionsArgs, URLSearchParams } from '@angular/http';
import { OptionsType } from '..';

@Injectable()
export class RequestOptionsBuilder {

    public static readonly FIELD_PREFIX = 'case.';

    buildOptions(metaCriteria: object, caseCriteria: object, view?: SearchView): OptionsType {
      let params = new HttpParams();

      if (view) {
        params = params.set('view', view);
      }

      if (metaCriteria) {
        for (let criterion of Object.keys(metaCriteria)) {
          params = params.set(criterion, metaCriteria[criterion]);
        }
      }

      if (caseCriteria) {
        for (let criterion of Object.keys(caseCriteria)) {
          if (caseCriteria[criterion] && caseCriteria[criterion].trim().length > 0) {
            params = params.set(RequestOptionsBuilder.FIELD_PREFIX + criterion, caseCriteria[criterion].trim());
          }
        }
      }

      let options: OptionsType = { params, observe: 'body'};
      return options;
    }

}

export type SearchView = 'SEARCH' | 'WORKBASKET';
