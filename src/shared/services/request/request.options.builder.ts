import { Injectable } from '@angular/core';
import { RequestOptionsArgs, URLSearchParams } from '@angular/http';

@Injectable()
export class RequestOptionsBuilder {

    public static readonly FIELD_PREFIX = 'case.';

    buildOptions(metaCriteria: object, caseCriteria: object, view?: SearchView): RequestOptionsArgs {
        let params: URLSearchParams = new URLSearchParams();

        if (view) {
          params.set('view', view);
        }

        if (metaCriteria) {
          for (let criterion of Object.keys(metaCriteria)) {
            params.set(criterion, metaCriteria[criterion]);
          }
        }

        if (caseCriteria) {
          for (let criterion of Object.keys(caseCriteria)) {
            if (caseCriteria[criterion] && caseCriteria[criterion].trim().length > 0) {
              params.set(RequestOptionsBuilder.FIELD_PREFIX + criterion, caseCriteria[criterion].trim());
            }
          }
        }

        let options: RequestOptionsArgs = { params };
        return options;
      }


    buildOptionsAndBody(metaCriteria: object, caseCriteria: object, view?: SearchView): {options: RequestOptionsArgs, body: any} {
      let params: URLSearchParams = new URLSearchParams();
      let body: object = this.prepareElasticQuery(metaCriteria);

      if (view) {
        params.set('view', view);
      }

      if (metaCriteria) {
        for (let criterion of Object.keys(metaCriteria)) {
          params.set(criterion, metaCriteria[criterion]);
        }
      }

      if (caseCriteria) {
        for (let criterion of Object.keys(caseCriteria)) {
          if (caseCriteria[criterion] && caseCriteria[criterion].trim().length > 0) {
            params.set(RequestOptionsBuilder.FIELD_PREFIX + criterion, caseCriteria[criterion].trim());
          }
        }
      }

      let options: RequestOptionsArgs = { params };
      return {options, body};
    }

    prepareElasticQuery(criteria: object): object {
      let query: object = {};
      let matchList: object[] = [];

      if (criteria) {
        for (let criterion of Object.keys(criteria)) {
          const match = { match: { ['data.' + criterion]: criteria[criterion] } };
          matchList.push(match);
        }

      }

      // query = {
      //   bool: {
      //     filter: matchList
      //   }
      // }

      query = {
        match_all: {}
      };


      return { query, size: 5 };
    }
}

export type SearchView = 'SEARCH' | 'WORKBASKET';
