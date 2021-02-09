import { URLSearchParams, RequestOptionsArgs } from '@angular/http';
import { HttpParams } from '@angular/common/http';
import { RequestOptionsBuilder } from './request.options.builder';
import { OptionsType } from '../http';

describe('RequestOptionsBuilder', () => {

  let params: HttpParams;
  let requestOptionsBuilder: RequestOptionsBuilder;

  describe('buildOptions()', () => {

    beforeEach(() => {
      function matchCall(value: any, expected: any): boolean {
        return expected === value ||
            JSON.stringify(expected) === JSON.stringify(value) ||
            expected[0] === value[0] && JSON.stringify(expected[1]).trim() === JSON.stringify(value[1]).trim();
      }

      jasmine.addCustomEqualityTester(matchCall);
      params = new HttpParams();
      requestOptionsBuilder = new RequestOptionsBuilder();
    });

    it('should not set if no params', () => {
      let result = requestOptionsBuilder.buildOptions({}, {});

      let expected: OptionsType = { params, observe: 'body'};
      expect(result).toEqual(expected);
    });

    it('should set view if present', () => {
      let result = requestOptionsBuilder.buildOptions({}, {}, 'WORKBASKET');

      params = params.set('view', 'WORKBASKET');
      let expected: OptionsType = { params, observe: 'body'};
      expect(result).toEqual(expected);
    });

    it('should set metaCriteria if present', () => {
      let metaCriteria = {'caseState': 'testState'};
      let result = requestOptionsBuilder.buildOptions(metaCriteria, {});

      params = params.set('caseState', 'testState');
      let expected: OptionsType = {params, observe: 'body'};
      expect(result).toEqual(expected);
    });

    // FIXME
    xit('should set caseCriteria if present', () => {
      let caseCriteria = {'firstName': 'testFirstName', 'lastName': 'testLastName'};
      let result = requestOptionsBuilder.buildOptions({}, caseCriteria);

      params = params.set('case.firstName', 'testFirstName');
      params = params.set('case.lastName', 'testLastName');
      let expected: OptionsType = {params, observe: 'body'};
      expect(result).toEqual(expected);
    });

    // FIXME
    xit('should set all params if present', () => {
      let metaCriteria = {'caseState': 'testState'};
      let caseCriteria = {'firstName': 'testFirstName', 'lastName': 'testLastName'};
      let result = requestOptionsBuilder.buildOptions(metaCriteria, caseCriteria, 'WORKBASKET');

      params = params.set('view', 'WORKBASKET');
      params = params.set('caseState', 'testState');
      params = params.set('case.firstName', 'testFirstName');
      params = params.set('case.lastName', 'testLastName');
      let expected: OptionsType = {params, observe: 'body'};
      expect(result).toEqual(expected);
    });
  });
});
